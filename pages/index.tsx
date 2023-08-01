import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { AuthErrorCodes, getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collectionGroup,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useEffect, useRef, useState } from "react";
import Header from "../components/Header/Header";
import Tabs from "../components/Tabs/Tabs";
import { Welcome } from "../components/Welcome";
import { AppProvider, LIMIT } from "../context/AppContext";
import {
  app,
  db,
  getPostWithMoreInfo,
  getProfileByUID,
  userToJSON,
} from "../lib/firebase";
import { getUserData, verifyIdToken } from "../lib/firebaseAdmin";
import { Props } from "../types/interfaces";

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
    // console.log("isVerify " + token.email_verified);
    let expired = false;
    const postQuery = query(
      collectionGroup(db, `posts`),
      where("visibility", "in", ["Friend", "Public"]),
      orderBy("createdAt", "desc"),
      limit(LIMIT)
    );

    const newPosts = await getPostWithMoreInfo(postQuery, uid);
    const profile = await getProfileByUID(uid);
    const currentAccount = (await getUserData(uid)) as UserRecord;
    const currentUserData = userToJSON(currentAccount);
    return {
      props: {
        expired,
        uid,
        allUsers: [],
        posts: newPosts,
        email,
        username: username ?? "Unknown",
        profile: profile! ?? null,
        account: currentUserData ?? null,
      },
    };
  } catch (error: any) {
    console.log("SSR Error " + error);
    let postError = error.code === "resource-exhausted" ? error.message : "";
    if (error.code === "resource-exhausted") {
      console.log(AuthErrorCodes.QUOTA_EXCEEDED);
      console.log("Resource Error : " + error);
    }
    // context.res.writeHead(302, { Location: "/login" });
    // context.res.end();
    return {
      props: {
        postError: postError,
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
  postError,
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
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, expired]);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
          },
        },
      })
  );
  const [limitedPosts, setlimitedPosts] = useState(posts!);
  useEffect(() => {
    setlimitedPosts(posts!);
  }, [posts]);

  // useEffect(() => {
  //   // const q = query(collection(db, "posts"), where("state", "==", "CA"));
  //   const q = query(
  //     collectionGroup(db, `posts`),
  //     where("visibility", "in", ["Friend", "Public"]),
  //     orderBy("createdAt", "desc"),
  //     limit(LIMIT)
  //   );
  //   const unsubscribe = onSnapshot(q, (querySnapshot) => {
  //     querySnapshot.forEach(async (doc) => {
  //       // console.log(doc.data());
  //       const p = await postToJSON(doc);
  //       setlimitedPosts(limitedPosts?.concat(p));
  //     });
  //   });
  //   return () => {
  //     unsubscribe;
  //   };
  // }, [uid]);

  if (expired) return <Welcome postError={postError} expired={expired} />;
  return (
    <AppProvider
      postError={postError!}
      limitedPosts={limitedPosts!}
      setlimitedPosts={setlimitedPosts!}
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
