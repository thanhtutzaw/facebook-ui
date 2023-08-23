import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import {
  AuthErrorCodes,
  Unsubscribe,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
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
  postToJSON,
  userToJSON,
} from "../lib/firebase";
import { getUserData, verifyIdToken } from "../lib/firebaseAdmin";
import { Props, account } from "../types/interfaces";

import { useActive } from "../hooks/useActiveTab";
import Spinner from "../components/Spinner";
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
    // const posts = await getDocs(postQuery);

    // const newPosts = await Promise.all(
    //   posts.docs.map(async (doc) => await postToJSON(doc))
    // );
    // const newPosts = await getPostWithMoreInfo(uid, postQuery);
    // const profileData = (await getProfileByUID(uid)) as account["profile"];
    // const currentAccount = (await getUserData(uid)) as UserRecord;
    const [newPosts, profileData, currentAccount] = await Promise.all([
      getPostWithMoreInfo(uid, postQuery),
      getProfileByUID(uid),
      getUserData(uid),
    ]);
    const profile = {
      ...profileData,
      photoURL: profileData.photoURL
        ? profileData.photoURL
        : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
    };
    const currentUserData = userToJSON(currentAccount);
    return {
      props: {
        expired: false,
        uid,
        posts: newPosts,
        email,
        username: username ?? "Unknown",
        profile,
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
  posts,
  email,
  username,
  profile,
  account,
}: Props) {
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

  const [limitedPosts, setlimitedPosts] = useState(posts ?? []);
  // useEffect(() => {
  //   // const lastestPost = limitedPosts.concat(posts!);
  //   if (posts?.length ?? 0 > 0) return;
  //   setlimitedPosts(posts!);
  //   // setlimitedPosts([{ ...limitedPosts },  posts!]);
  // }, [posts]);

  useEffect(() => {
    let unsubscribe: Unsubscribe;
    const postQuery = query(
      collectionGroup(db, `posts`),
      where("visibility", "in", ["Friend", "Public"]),
      orderBy("createdAt", "desc"),
      limit(limitedPosts.length > 0 ? limitedPosts.length : LIMIT)
    );
    unsubscribe = onSnapshot(postQuery, async (snapshot) => {
      const posts =
        (await getPostWithMoreInfo(uid!, undefined, snapshot)) ?? [];
      setlimitedPosts(posts);
      console.log("updated posts");
    });
    return () => {
      unsubscribe();
    };
  }, [limitedPosts.length, uid]);
  useEffect(() => {
    if (expired) return;
    if (!uid) {
      router.push("/login");
    }
  }, [expired, router, uid]);
  const [UnReadNotiCount, setUnReadNotiCount] = useState(0)
  useEffect(() => {
    let lastPull;
    const userDoc = doc(db, `users/${uid}`);

    const unsubscribe = onSnapshot(userDoc, async(doc) => {
      lastPull = doc.data()?.lastPullTimestamp;

      const notiQuery = query(
        collection(db, `/users/${uid}/notifications`),
        where("createdAt", ">", lastPull)
      );

      const notiCollection = await getDocs(notiQuery);
      setUnReadNotiCount(notiCollection.size);
    });

    return () => {
      unsubscribe(); // Clean up the listener when the component unmounts
    };
  }, [uid]);

  const { active, setActive } = useActive();

  if (expired) return <Welcome postError={postError} expired={expired} />;
  return uid ? (
    <AppProvider
      UnReadNotiCount={UnReadNotiCount}
      active={active!}
      setActive={setActive!}
      postError={postError!}
      limitedPosts={limitedPosts!}
      setlimitedPosts={setlimitedPosts!}
      profile={profile!}
      expired={expired}
      username={username}
      uid={uid}
      posts={posts}
      email={email}
      account={account}
    >
      <Header tabIndex={active === "/" ? 0 : -1} indicatorRef={indicatorRef} />
      <Tabs indicatorRef={indicatorRef} />
    </AppProvider>
  ) : (
    <Spinner fullScreen style={{ margin: "0" }} />
  );
}
