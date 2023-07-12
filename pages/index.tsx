import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useEffect, useRef } from "react";
import Header from "../components/Header/Header";
import Tabs from "../components/Tabs/Tabs";
import { Welcome } from "../components/Welcome";
import { AppProvider } from "../context/AppContext";
import { app, db, fethUserDoc, postToJSON, userToJSON } from "../lib/firebase";
import { getUserData, verifyIdToken } from "../lib/firebaseAdmin";
import { Props } from "../types/interfaces";
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;

    const convertSecondsToTime = (seconds: number) => {
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      return { days, hours, minutes, seconds: remainingSeconds };
    };
    console.log(convertSecondsToTime(token.exp));
    const { name: username, email, uid } = token;
    console.log("isVerify " + token.email_verified);
    // console.log(token);
    let expired = false;
    const postQuery = query(
      collectionGroup(db, `posts`),
      // where(`visibility`, "!=", "Onlyme"),
      // orderBy("visibility", "asc"),
      orderBy("createdAt", "desc")
    );
    const postSnap = await getDocs(postQuery);
    const posts = await Promise.all(
      postSnap.docs.map(async (doc) => {
        const post = await postToJSON(doc);
        const UserRecord = (await getUserData(post.authorId)) as UserRecord;
        const userJSON = userToJSON(UserRecord);
        return {
          ...post,
          author: {
            ...userJSON,
          },
        };
      })
    );
    console.log(posts);
    const mypostQuery = query(
      collection(db, `/users/${uid}/posts`),
      orderBy("createdAt", "desc")
    );
    const myPostSnap = await getDocs(mypostQuery);
    const myPost = await Promise.all(
      myPostSnap.docs.map((doc) => postToJSON(doc))
    );
    // const user = await fethUserDoc(uid);
    // const profile = user.data()?.profile;
    const profileQuery = doc(db, `/users/${uid}`);
    const profileSnap = await getDoc(profileQuery);

    const profile = profileSnap.data()?.profile;
    const allUsersQuery = collectionGroup(db, `users`);
    const allUsersSnap = await getDocs(allUsersQuery);
    const allUsers = allUsersSnap.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        };
      })
      .filter((users) => users.id !== uid);

    return {
      props: {
        expired,
        uid,
        // allUsers: allUser,
        allUsers,
        posts,
        email,
        username: username ?? "Unknown",
        myPost,
        profile: profile ?? null,
      },
    };
  } catch (error) {
    console.log("SSR Error " + error);
    // context.res.writeHead(302, { Location: "/" });
    // context.res.writeHead(302, { Location: "/login" });
    // context.res.end();
    return {
      props: {
        expired: true,
        uid: "",
        allUsers: [],
        posts: [],
        email: "",
        username: "",
        myPost: [],
        profile: null,
      },
    };
  }
};
export default function Home({
  expired,
  uid,
  allUsers,
  posts,
  email,
  username,
  myPost,
  profile,
}: Props) {
  // props: InferGetServerSidePropsType<typeof getServerSideProps>
  const indicatorRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const auth = getAuth(app);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        if (!expired) return;
        router.push("/");
        // console.log("expired , user exist and pushed");
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, expired]);

  // }, [active]);
  // if (!email) return <></>;
  if (expired) return <Welcome expired={expired} />;
  return (
    <AppProvider
      profile={profile}
      expired={expired}
      username={username}
      uid={uid}
      allUsers={allUsers}
      posts={posts}
      email={email}
      myPost={myPost}
    >
      <Header indicatorRef={indicatorRef} />
      <Tabs indicatorRef={indicatorRef} />
    </AppProvider>
  );
}
