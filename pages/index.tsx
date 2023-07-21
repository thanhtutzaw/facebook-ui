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
import { Post, Props, account } from "../types/interfaces";
import Header from "../components/Header/Header";
import { fetchPosts } from "../lib/firestore/post";
// import QueryClient from "react-query/types/core";
// import { QueryClient, QueryClientProvider } from "react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

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

        // if (!likeDoc.empty) {
        //   console.log(likeDoc.docs.length);
        //   // setlike(likeDoc.docs.length);
        //   return likeDoc.docs.length;
        // } else {
        //   // setlike(0);
        //   console.log("like empty");
        // }
        return {
          ...post,
          // like:[...like],
          author: {
            ...userJSON,
          },
        };
      })
    );
    const withLike = (await Promise.all(
      posts.map(async (p) => {
        if (p) {
          const postRef = doc(db, `users/${p.authorId}/posts/${p.id}`);
          const likeRef = collection(postRef, "likes");
          const likeDoc = await getDocs(likeRef);
          const like = likeDoc.docs.map((doc) => doc.data());
          const data = {
            ...p,
            like: [...like],
            // like: "hello",
          };
          console.log(data);
          if (!likeDoc.empty) {
            return data;
            // return likeDoc.docs.length;
          } else {
            // setlike(0);
            console.log("like empty");
            return {
              ...p,
            };
          }
        }
        // return {
        //   ...p
        // };
      })
    )) as Post[];
    // console.log(withLike);
    const newPosts = await Promise.all(
      withLike.map(async (p) => {
        if (p.sharePost) {
          const postDoc = doc(
            db,
            `users/${p.sharePost?.author}/posts/${p.sharePost?.id}`
          );
          const posts = await getDoc(postDoc);
          if (posts.exists()) {
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
          } else {
            return {
              ...p,
              sharePost: { ...p.sharePost, post: null },
            };
          }
        }
        return {
          ...p,
        };
      })
    );

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
  const queryClient = new QueryClient();

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
      <QueryClientProvider client={queryClient}>
        <Header indicatorRef={indicatorRef} />
        <Tabs indicatorRef={indicatorRef} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AppProvider>
  );
}
