import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
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
  userToJSON,
} from "../lib/firebase";
import { getUserData, verifyIdToken } from "../lib/firebaseAdmin";
import { Props } from "../types/interfaces";

import Spinner from "../components/Spinner";
import { useActive } from "../hooks/useActiveTab";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;
    console.log(token.uid + " in index");

    const convertSecondsToTime = (seconds: number) => {
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      return { days, hours, minutes, seconds: remainingSeconds };
    };
    // console.log(convertSecondsToTime(token.exp));
    const { name: username, email, uid } = token;
    // console.log("isVerify " + token.email_verified);
    // const friends = ;
    const myFriendsQuery = query(
      collection(db, `users/${uid}/friends`),
      where("status", "==", "friend"),
      orderBy("updatedAt", "desc")
    );
    const myFriendsSnap = await getDocs(myFriendsQuery);
    const acceptedFriends = await Promise.all(
      myFriendsSnap.docs.map(async (doc) => {
        return doc.id;
      })
    );
    const isFriendEmpty = myFriendsSnap.empty;
    // console.log(acceptedFriends);
    let expired = false;
    const postQuery = query(
      collectionGroup(db, `posts`),
      // where("visibility", "in", ["Friend", "Public"]),
      where("authorId", "in", !isFriendEmpty ? acceptedFriends : [uid]),
      orderBy("createdAt", "desc"),
      limit(LIMIT)
    );

    const [newPosts, profileData, currentAccount] = await Promise.all([
      getPostWithMoreInfo(uid, postQuery),
      getProfileByUID(uid),
      getUserData(uid),
    ]);
    console.log(newPosts);
    const profile = {
      ...profileData,
      photoURL: profileData.photoURL
        ? profileData.photoURL
        : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
    };
    const currentUserData = userToJSON(currentAccount);
    // context.res.setHeader(
    //   "Cache-Control",
    //   "public, s-maxage=10, stale-while-revalidate=59"
    // );
    return {
      props: {
        expired: false,
        uid,
        posts: newPosts,
        email,
        username: username ?? "Unknown",
        profile,
        account: currentUserData ?? null,
        acceptedFriends,
        isFriendEmpty,
        // posts: [],
        // profile: null,
        // account: null,
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
        acceptedFriends: [],
        posts: [],
        isFriendEmpty: false,
        email: "",
        username: "",
        profile: null,
        account: null,
      },
    };
  }
};
export default function Home({
  acceptedFriends,
  isFriendEmpty,
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

  useEffect(() => {
    // const lastestPost = limitedPosts.concat(posts!);
    // if (posts?.length ?? 0 > 0) return;
    if (!expired) setlimitedPosts(posts!);
    // setlimitedPosts([{ ...limitedPosts },  posts!]);
  }, [expired, posts]);

  useEffect(() => {
    let unsubscribe: Unsubscribe;
    // const postQuery = query(
    //   collectionGroup(db, `posts`),
    //   where("visibility", "in", ["Friend", "Public"]),

    //   orderBy("createdAt", "desc"),
    //   limit(limitedPosts.length > 0 ? limitedPosts.length : LIMIT)
    // );
    const postQuery = query(
      collectionGroup(db, `posts`),
      // where("visibility", "in", ["Friend", "Public"]),
      where("authorId", "in", !isFriendEmpty ? acceptedFriends : [uid]),
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
  }, [acceptedFriends, isFriendEmpty, limitedPosts.length, uid]);
  useEffect(() => {
    if (expired) return;
    if (!uid) {
      router.push("/login");
    }
  }, [expired, router, uid]);
  const [UnReadNotiCount, setUnReadNotiCount] = useState(0);
  const [lastPullTimestamp, setlastPullTimestamp] =
    useState<Props["lastPullTimestamp"]>(undefined);
  useEffect(() => {
    if (!uid) return;
    let unsubscribeNotifications: Unsubscribe;
    const fetchNotiCount = async () => {
      const userDoc = doc(db, `users/${uid}`);
      try {
        const doc = await getDoc(userDoc);
        const lastPull = doc.data()?.lastPullTimestamp ?? Date.now();
        setlastPullTimestamp(lastPull);
        // listening notifications
        const notiQuery = query(
          collection(db, `/users/${uid}/notifications`),
          where("createdAt", ">", lastPull),
          limit(10)
        );
        // const count = (await getCountFromServer(notiQuery)).data().count;
        // if (UnReadNotiCount >= 10) return;
        console.log("noti listening realtime - unRead" + UnReadNotiCount);
        unsubscribeNotifications = onSnapshot(notiQuery, (querySnapshot) => {
          console.log(querySnapshot.docs.map((doc) => doc.data()));
          setUnReadNotiCount(querySnapshot.size); // getting unRead noti count
          // setUnReadNotiCount(count); // getting unRead noti count
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchNotiCount();
    return () => {
      unsubscribeNotifications();
    };
  }, [UnReadNotiCount, uid]);
  const { active, setActive } = useActive();
  // const { isPage, setisPage } = useContext(PageContext) as PageProps;
  // setisPage?.(uid);

  if (expired) return <Welcome postError={postError} expired={expired} />;
  return uid ? (
    <AppProvider
      acceptedFriends={acceptedFriends}
      isFriendEmpty={isFriendEmpty}
      lastPullTimestamp={lastPullTimestamp}
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
      {/* {uid + "- SSR uid (not page accessable) "} */}
      <Header tabIndex={active === "/" ? 0 : -1} indicatorRef={indicatorRef} />
      {/* {JSON.stringify(isPage)} {isPage && "- all page accessable"} */}
      {/* <button onClick={() => setisPage?.(isPage?.concat([9, 10]))}>
        change
      </button> */}
      <Tabs indicatorRef={indicatorRef} />
    </AppProvider>
  ) : (
    <Spinner fullScreen navBar={false} />
  );
}
