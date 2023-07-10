import { IdTokenResult, getAuth, onAuthStateChanged } from "firebase/auth";
import {
  DocumentData,
  QueryDocumentSnapshot,
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
import { app, db, postToJSON } from "../lib/firebase";
import { getUserData, verifyIdToken } from "../lib/firebaseAdmin";
import { Post, Props } from "../types/interfaces";
import email from "./login/email";
import { profile } from "console";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
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
    // console.log();
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
        const user = (await getUserData(post.authorId)) as UserRecord;
        const authorName = user?.displayName ?? "Unknown User";
        return {
          ...post,
          author: { name: authorName },
        };
      })
    );
    // const newPosts = await Promise.all(
    //   posts.map(async (p) => {
    //     const user = (await getUserData(p.authorId)) as UserRecord;
    //     return {
    //       ...p,
    //       authorName: user?.displayName ?? "Unknown",
    //     };
    //   })
    // );
    // console.log(posts);
    // console.log(user?.displayName);
    // console.log(posts);
    // const getDate = (post: Post) => {
    //   const date = new Timestamp(
    //     post.createdAt.seconds,
    //     post.createdAt.nanoseconds
    //   );
    //   return {
    //     date,
    //   };
    // };
    // .sort((a, b) => a.createdAt - b.createdAt);

    // getting all users posts
    // db/users/uid-JE0sy/posts/abc
    // const data = doc.data() as Post;
    const mypostQuery = query(
      collection(db, `/users/${uid}/posts`),
      orderBy("createdAt", "desc")
    );
    const myPostSnap = await getDocs(mypostQuery);
    // getUserData;
    const myPost = await Promise.all(
      myPostSnap.docs.map((doc) => postToJSON(doc))
    );
    const profileQuery = doc(db, `/users/${uid}`);
    const profileSnap = await getDoc(profileQuery);

    const profile = profileSnap.data()?.profile;
    // console.log(profile?.profile);
    // if (!myPost) {
    //   return {
    //     notFound: true,
    //   };
    // }
    const allUsersQuery = collectionGroup(db, `users`);

    const allUsersSnap = await getDocs(allUsersQuery);

    const allUsers = allUsersSnap.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // ...getUserData(doc.id),
        };
      })
      .filter((users) => users.id !== uid);
    // const allUser = allUsers.map(async (user) => {
    //   await getUserData(user.id, allUsers);
    // });
    // const user = await auth(app).getUser(post.toString());
    // setauthorName(user.displayName! ?? "");
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
        profile: profile ?? [],
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
