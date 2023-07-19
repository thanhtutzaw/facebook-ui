import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  DocumentData,
  DocumentSnapshot,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useEffect, useRef } from "react";
import Tabs from "../components/Tabs/Tabs";
import { Welcome } from "../components/Welcome";
import { AppProvider } from "../context/AppContext";
import { app, db, fethUserDoc, postToJSON, userToJSON } from "../lib/firebase";
import { getUserData, verifyIdToken } from "../lib/firebaseAdmin";
import { Props, account } from "../types/interfaces";
import Header from "../components/Header/Header";
import { fetchPosts } from "../lib/firestore/post";
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

    const account = (await getUserData(uid as string))! as UserRecord;
    const accountJSON = userToJSON(account);
    // console.log("isVerify " + token.email_verified);
    // console.log(token);
    let expired = false;
    const postQuery = query(
      collectionGroup(db, `posts`),
      where("visibility", "in", ["Friend", "Public"]),

      // where(`visibility`, "!=", "Onlyme"),
      // orderBy("visibility", "asc"),
      orderBy("createdAt", "desc")
    );
    const postSnap = await getDocs(postQuery);

    // const post = await fetchPosts(postSnap);
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
    const newPosts = await Promise.all(
      posts.map(async (p) => {
        if (p.sharePost) {
          const postDoc = doc(
            db,
            `users/${p.sharePost?.author}/posts/${p.sharePost?.id}`
          );
          const posts = await getDoc(postDoc);
          const post = await postToJSON(
            posts as DocumentSnapshot<DocumentData>
          );
          const UserRecord = await getUserData(post.authorId);
          const userJSON = userToJSON(UserRecord);
          const sharePost = {
            ...post,
            author: {
              ...userJSON,
            },
          };
          return {
            ...p,
            sharePost: { ...p.sharePost, post: { ...sharePost } },
          };
        }
        return {
          ...p,
        };
      })
    );

    // console.log(newPosts);
    const profileQuery = doc(db, `/users/${uid}`);
    const profileSnap = await getDoc(profileQuery);
    const profileData = profileSnap.data()!;
    const profile = profileData.profile as account["profile"];

    const allUsersQuery = query(
      collection(db, `users`),
      where("__name__", "!=", uid)
    );
    const allUsersSnap = await getDocs(allUsersQuery);
    const allUsers = await Promise.all(
      allUsersSnap.docs.map(async (doc) => {
        const data = doc.data();
        const account = (await getUserData(doc.id as string))! as UserRecord;
        const accountJSON = userToJSON(account) as UserRecord;
        return {
          id: doc.id,
          ...data,
          author: {
            ...accountJSON,
          },
        };
      })
    );

    return {
      props: {
        expired,
        uid,
        allUsers,
        posts: newPosts,
        email,
        username: username ?? "Unknown",
        profile: profile! ?? null,
        account: accountJSON ?? null,
      },
    };
  } catch (error) {
    console.log("SSR Error " + error);
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
        profile: null,
        account: null,
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
  profile,
  account,
}: Props) {
  // props: InferGetServerSidePropsType<typeof getServerSideProps>
  const indicatorRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const auth = getAuth(app);
  useEffect(() => {
    const auth = getAuth(app);
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
      profile={profile!}
      expired={expired}
      username={username}
      uid={uid}
      allUsers={allUsers}
      posts={posts}
      email={email}
      account={account}
    >
      <Header indicatorRef={indicatorRef} />
      <Tabs indicatorRef={indicatorRef} />
    </AppProvider>
  );
}
