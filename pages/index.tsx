import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import {
  AuthErrorCodes,
  Unsubscribe,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import {
  Timestamp,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useContext, useEffect, useRef, useState } from "react";
import Header from "../components/Header/Header";
import Tabs from "../components/Tabs/Tabs";
import { Welcome } from "../components/Welcome";
import { AppProvider } from "../context/AppContext";
import {
  app,
  db,
  fethUserDoc,
  getNewsFeed,
  getPostWithMoreInfo,
  getProfileByUID,
  userToJSON,
} from "../lib/firebase";
import { getUserData, verifyIdToken } from "../lib/firebaseAdmin";
import friendReqSound from "../public/NotiSounds/chord.mp3";
import { AppProps, account, friends } from "../types/interfaces";

import SecondaryPage from "@/components/QueryPage";
import { getMessaging, getToken } from "firebase/messaging";
import Spinner from "../components/Spinner";
import { PageContext, PageProps } from "../context/PageContext";
import {
  MYPOST_LIMIT,
  NewsFeed_LIMIT,
  UnReadNoti_LIMIT,
} from "../lib/QUERY_LIMIT";
import { useActive } from "@/hooks/useActiveTab";
export const getServerSideProps: GetServerSideProps<AppProps> = async (
  context
) => {
  let expired = true;
  let tokenUID;
  let queryPageData = null;
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;
    expired = !token;
    const userQuery = context.query.user!;
    if (userQuery) {
      const user = await fethUserDoc(userQuery);
      const userExist = user.exists();
      const isFriendsQuery = doc(db, `users/${token.uid}/friends/${userQuery}`);
      const friendDoc = await getDoc(isFriendsQuery);
      let isFriend = false,
        isBlocked = false,
        isPending = false,
        canAccept = false,
        canUnBlock = false;
      if (friendDoc.exists()) {
        const relation = friendDoc.data() as friends;
        isFriend = relation.status === "friend";
        isPending = relation.status === "pending";
        isBlocked = relation.status === "block";
        canAccept = relation.senderId !== token.uid && !isFriend;
        canUnBlock = relation.senderId === token.uid;
      }
      let mypostQuery = query(
        collection(db, `/users/${userQuery}/posts`),
        where("visibility", "in", ["Public"]),
        orderBy("createdAt", "desc"),
        limit(MYPOST_LIMIT)
      );
      if (isFriend) {
        mypostQuery = query(
          collection(db, `/users/${userQuery}/posts`),
          where("visibility", "in", ["Friend", "Public"]),
          orderBy("createdAt", "desc"),
          limit(MYPOST_LIMIT)
        );
      }

      if (user.exists() && !expired) {
        const profile = user?.data().profile as account["profile"];
        const myPost = isBlocked
          ? null
          : await getPostWithMoreInfo(userQuery as string, mypostQuery);
        queryPageData = { profile, myPost };
      } else {
        queryPageData = null;
      }
      console.log(
        `user query page(I can fetch user data for userQuery Page)`,
        userQuery
      );
    }
    // console.log({ cookies });
    const convertSecondsToTime = (seconds: number) => {
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      return { days, hours, minutes, seconds: remainingSeconds };
    };
    // console.log(convertSecondsToTime(token.exp));
    const { name: username, email, uid } = token;
    tokenUID = uid;
    // console.log("isVerify " + token.email_verified);
    const myFriendsQuery = query(
      collection(db, `users/${uid}/friends`),
      where("status", "==", "friend"),
      orderBy("updatedAt", "desc")
    );
    const myFriendsSnap = await getDocs(myFriendsQuery);
    const acceptedFriends = myFriendsSnap.docs.map((doc) => doc.id);
    console.log({ acceptedFriends });
    const feedUser = myFriendsSnap.docs.map((doc) => {
      return { id: doc.data().id } as { id: string };
    });
    const feedUserWithAdmin = [{ id: uid }, ...feedUser];
    // console.log(feedUserWithAdmin);
    const userPostsSubCollectionRef = collection(db, `users/${uid}/friends`);

    // Reference to the "recentPostSubCollection" subcollection within the user's "postsSubCollection"
    const newsFeedQuery = query(
      collection(db, `users/${uid}/recentPosts`),
      orderBy("createdAt", "desc"),
      limit(NewsFeed_LIMIT)
    );
    let recentPosts;
    try {
      recentPosts = (await getDocs(newsFeedQuery)).docs.map((doc) => {
        // const authorId = doc.ref.parent.parent?.id!;
        return {
          ...doc.data(),
          // authorId ,
        };
      });
    } catch (error) {
      console.log("Recent Post Error - ", error);
    }
    // const recentPosts = await Promise.all(
    // feedUserWithAdmin.map(async (friend) => {

    // return (await getDocs(newsFeedQuery).docs.map((doc) => {
    //   const authorId = doc.ref.parent.parent?.id;
    //   return {
    //     ...doc.data(),
    //     authorId,
    //   };
    // });
    // })
    // feedUserWithAdmin.map(async (friend) => {
    //   const newsFeedQuery = query(
    //     collection(db, `users/${uid}/friends/${friend.id}/recentPosts`),
    //     orderBy("createdAt", "desc"),
    //     limit(NewsFeed_LIMIT)
    //   );
    //   return (await getDocs(newsFeedQuery)).docs.map((doc) => {
    //     const authorId = doc.ref.parent.parent?.id;
    //     return {
    //       ...doc.data(),
    //       authorId,
    //     };
    //   });
    // })
    // );
    // console.log(friendsDoc.reduce);
    // const posts = recentPosts.reduce((acc, cur) => acc.concat(cur), []);
    const newsFeedWithMe = [...acceptedFriends, uid];
    const isFriendEmpty = myFriendsSnap.empty;
    const friendsList = !isFriendEmpty ? newsFeedWithMe : [uid];
    // const data = await Promise.all(
    //   acceptedFriends2.map(async ({ id, updatedAt }) => {
    //     // console.log(id);
    //     const postQuery = query(
    //       collection(db, `users/${id}/posts`),
    //       where("visibility", "in", ["Friend", "Public"]),
    //       orderBy("createdAt", "desc"),
    //     );
    //     const ddocs = await getDocs(postQuery)
    //     return await Promise.all(
    //       ddocs.docs.map(async (doc) => doc.id)
    //     );
    //   })
    // );
    // const startNewsFeedDate = myFriendsSnap.docs[1]
    //   .data()
    //   .updatedAt.toJSON() as Timestamp;
    // const startNewsFeedDate = myFriendsSnap.docs[0].data()
    //   .updatedAt as Timestamp;
    // const date = new Timestamp(
    //   startNewsFeedDate.seconds,
    //   startNewsFeedDate.nanoseconds
    // );
    // const date = new Timestamp(
    //   startNewsFeedDate.seconds,
    //   startNewsFeedDate.nanoseconds
    // );
    // console.log(startNewsFeedDate);
    // const startNewsFeed = new Timestamp(1693404110, 291000000);
    // const startNewsFeed = new Timestamp(
    //   startNewsFeedDate.seconds,
    //   startNewsFeedDate.nanoseconds
    // );
    // console.log(myFriendsSnap.docs[0].data());
    // let expired = false;
    // const postQuery = query(
    //   collectionGroup(db, `posts`),
    //   where("authorId", "in", friendsList),
    //   // where("visibility", "in", ["Friend", "Public"]),
    //   where("updatedAt", ">=", new Timestamp(1693409835, 2000000)),
    //   orderBy("createdAt", "desc"),
    // );
    // const myFriendsQuery = query(
    //   collection(db, `users/${uid}/friends`),
    //   where("status", "==", "friend"),
    //   orderBy("updatedAt", "desc")
    // );
    // const postQuery = query(
    //   collectionGroup(db, `posts`),
    //   // where("authorId", "in", friendsList),
    //   // where("visibility", "in", ["Friend", "Public"]),
    //   // where("updatedAt", ">=", new Timestamp(1693409835, 2000000)),
    //   orderBy("createdAt", "desc"),
    // );

    const [newsFeedPosts, profileData, currentAccount] = await Promise.all([
      getNewsFeed(uid, recentPosts),
      // getPostWithMoreInfo(uid, postQuery),
      getProfileByUID(uid),
      getUserData(uid),
    ]);
    const fcmToken = (await fethUserDoc(uid)).data()?.fcmToken ?? null;
    const profile = {
      ...profileData,
      photoURL: profileData.photoURL
        ? profileData.photoURL
        : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
    };
    const currentUserData = userToJSON(currentAccount);
    context.res.setHeader(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate=59"
    );
    return {
      props: {
        queryPageData,
        token,
        expired: expired,
        uid,
        posts: newsFeedPosts,
        email,
        username: username ?? "Unknown",
        profile,
        account: currentUserData ?? null,
        postError: "",
        acceptedFriends,
        isFriendEmpty,
        fcmToken,
        // posts: [],
        // profile: null,
        // account: null,
      },
    };
  } catch (error: any) {
    console.log(tokenUID);
    // expired = !error.code
    expired = error.code === "auth/argument-error";
    console.log("SSR Error in index.tsx " + error);
    console.log("SSR ErrorCode in index.tsx " + error.code);
    let postError = error.code === "resource-exhausted" ? error.message : "";
    let resourceError =
      error.code === "resource-exhausted" ? error.message : "";
    if (error.code === "resource-exhausted") {
      console.log(AuthErrorCodes.QUOTA_EXCEEDED);
      console.log("Resource Error : " + error);
    }
    // const isTokenError = error.code === "resource-exhausted";
    // context.res.writeHead(302, { Location: "/login" });
    // context.res.end();
    return {
      props: {
        queryPageData: null,
        token: null,
        postError,
        expired: expired,
        uid: tokenUID ?? "",
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
  queryPageData,
  token,
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
  fcmToken,
}: AppProps) {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const auth = getAuth(app);
  const [friendReqCount, setfriendReqCount] = useState(0);
  const [queryPageCache, setqueryPageCache] = useState(
    queryPageData ? [{ ...queryPageData }] : []
  );
  useEffect(() => {
    if (queryPageData) {
      // setqueryPageCache((: any) => [prev, ...queryPageData]);prev
      // console.log([queryPageCache, queryPageData]);
      // setqueryPageCache((prev) =>  {...queryPageData});
      setqueryPageCache((prev) => [...prev, queryPageData]);
    }
  }, [queryPageData]);
  useEffect(() => {
    console.log(queryPageCache);
  }, [queryPageCache]);

  const {
    newsFeedData,
    setnewsFeedData,
    setfriends,
    setnotiPermission,
    // active: activeTab,
  } = useContext(PageContext) as PageProps;
  // const [prevfriendReqCount, setprevfriendReqCount] = useState(0);
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
    if (posts && !newsFeedData) {
      setnewsFeedData?.(posts);
    }
  }, [newsFeedData, posts, setnewsFeedData]);

  useEffect(() => {
    // const lastestPost = limitedPosts.concat(posts!);
    // if (posts?.length ?? 0 > 0) return;
    if (!expired) setlimitedPosts(posts!);
    // setlimitedPosts([{ ...limitedPosts },  posts!]);
  }, [expired, posts]);

  // useEffect(() => {
  //   let unsubscribe: Unsubscribe;
  //   // const postQuery = query(
  //   //   collectionGroup(db, `posts`),
  //   //   where("visibility", "in", ["Friend", "Public"]),
  //   //   orderBy("createdAt", "desc"),
  //   //   limit(limitedPosts.length > 0 ? limitedPosts.length : NewsFeed_LIMIT)
  //   // );
  //   const postQuery = query(
  //     collectionGroup(db, `posts`),
  //     // where("visibility", "in", ["Friend", "Public"]),
  //     where("authorId", "in", !isFriendEmpty ? acceptedFriends : [uid]),
  //     orderBy("createdAt", "desc"),
  //     limit(limitedPosts.length > 0 ? limitedPosts.length : NewsFeed_LIMIT)
  //   );
  //   unsubscribe = onSnapshot(postQuery, async (snapshot) => {
  //     const posts =
  //       (await getPostWithMoreInfo(uid!, undefined, snapshot)) ?? [];
  //     setlimitedPosts(posts);
  //     console.log("updated posts");
  //   });
  //   return () => {
  //     unsubscribe();
  //   };
  // }, [acceptedFriends, isFriendEmpty, limitedPosts.length, uid]);
  useEffect(() => {
    if (expired) return;
    if (!uid) {
      // router.push("/login");
    }
  }, [expired, router, uid]);
  const [UnReadNotiCount, setUnReadNotiCount] = useState(0);
  // const [friendReqLastPull, setfriendReqLastPull] = useState(Date.now);
  const [lastPullTimestamp, setlastPullTimestamp] =
    useState<AppProps["lastPullTimestamp"]>(undefined);
  useEffect(() => {
    if (!uid) return;
    let unsubscribeNotifications: Unsubscribe;
    const fetchNotiCount = async () => {
      const userDoc = doc(db, `users/${uid}`);
      try {
        const doc = await getDoc(userDoc);
        const lastPull = doc.data()?.lastPullTimestamp ?? Date.now();
        setlastPullTimestamp(lastPull);
        const notiCountQuery = query(
          collection(db, `/users/${uid}/notifications`),
          where("createdAt", ">", lastPull),
          limit(UnReadNoti_LIMIT)
        );
        // const count = (await getCountFromServer(notiCountQuery)).data().count;
        // if (UnReadNotiCount >= 10) return;
        console.log("noti listening realtime - unRead" + UnReadNotiCount);
        unsubscribeNotifications = onSnapshot(
          notiCountQuery,
          (querySnapshot) => {
            console.log(querySnapshot.docs.map((doc) => doc.data()));
            setUnReadNotiCount(querySnapshot.size); // getting unRead noti count
            // setUnReadNotiCount(count); // getting unRead noti count
          }
        );
      } catch (error) {
        console.log(error);
      }
    };
    fetchNotiCount();
    return () => {
      if (unsubscribeNotifications) unsubscribeNotifications();
    };
  }, [UnReadNotiCount, uid]);
  // const [playFriendRequest] = useSound(friendReqSound, { volume: 0.11 });
  const soundRef = useRef<HTMLAudioElement>(null);
  // useEffect(() => {
  //   const friendReqCountRef = doc(db, `users/${uid}/friendReqCount/reqCount`);
  //   async function fetchFriendReqLastPull() {
  //     await updateDoc(friendReqCountRef, {
  //       lastPullTimestamp: serverTimestamp(),
  //     });
  //     // setfriendReqLastPull(
  //     // );
  //   }
  //   fetchFriendReqLastPull();
  // }, [uid]);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setnotiPermission?.(true);
          // console.log(await navigator.serviceWorker.controller);
          console.log("Notification permission granted.");
        } else {
          setnotiPermission?.(false);
          console.log("Notification permission denied.");
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    };
    requestNotificationPermission();
  }, [setnotiPermission]);

  useEffect(() => {
    if (
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      const messaging = getMessaging(app);

      const getFCMToken = async () => {
        try {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_MessageKey,
          });
          // console.log(process.env.NEXT_PUBLIC_MessageKey);
          if (token && uid) {
            console.log("FCM token:", token);
            const shouldStoreNewDeviceToken = fcmToken?.includes(token);
            if (shouldStoreNewDeviceToken) return;
            const userDoc = doc(db, `users/${uid}`);

            await updateDoc(userDoc, { fcmToken: arrayUnion(token) });

            console.log("stored token to db");
          } else {
            console.log("No FCM token received.");
          }
        } catch (error) {
          console.error("Error getting FCM token:", error);
        }
      };
      getFCMToken();
    } else {
      console.log("FCM not supported");
    }
  }, [fcmToken, uid]);

  useEffect(() => {
    if (!uid) return;
    const friendReqCountRef = doc(db, `users/${uid}/friendReqCount/reqCount`);
    let lastPull: Timestamp | null = null;
    async function getLastpull() {
      lastPull = (await getDoc(friendReqCountRef)).data()
        ?.lastPullTimestamp as Timestamp;
    }
    getLastpull();
    let unsubscribeFriendReqCount: Unsubscribe;
    const fetchFriendReqCount = async () => {
      const pendingRef = collection(db, `users/${uid}/friendReqCount`);
      try {
        if (friendReqCount >= 10) return;
        unsubscribeFriendReqCount = onSnapshot(pendingRef, (snap) => {
          snap.docs.map((doc) => {
            const updatedAt =
              doc.data().updatedAt?.toDate()?.getTime() ?? Date.now();
            const count = doc.data().count;
            const newCount = count;
            if (count > 0) {
              console.log(lastPull?.toDate().getTime! < updatedAt);
              const audioElement = soundRef.current;

              if (updatedAt > Date.now()) {
                if (audioElement) {
                  // Decrease the volume by setting it to a value less than 1.0
                  audioElement.volume = 0.4; // Adjust the volume as needed (0.5 means 50% volume)
                  audioElement
                    .play()
                    .then(() => {
                      soundRef.current?.play();
                      console.log("allow");
                    })
                    .catch(() => {
                      soundRef.current?.pause();
                      console.log(
                        "Audio autoplay not allowed (Try app at HomeScreen)"
                      );
                    });
                }
                // soundRef.current
                //   ?.
                // try {
                //   soundRef.current?.play();
                //   console.log("Audio autoplay Allowed in HomeScreen App");
                //   playFriendRequest();
                // } catch (error) {
                //   soundRef.current?.pause();
                //   console.log(
                //     "Audio autoplay not allowed (Try agin by adding App to HomeScreen)"
                //   );
                // }
              }
            }
            // setprevfriendReqCount(newCount);
            setfriendReqCount(count);
          });
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchFriendReqCount();
    return () => {
      if (unsubscribeFriendReqCount) unsubscribeFriendReqCount();
    };
  }, [friendReqCount, uid]);
  // useEffect(() => {
  //   console.log({ friendReqCount, prevfriendReqCount });
  // }, [friendReqCount, prevfriendReqCount]);

  useEffect(() => {
    setfriends?.(acceptedFriends);
    console.log(acceptedFriends);
  }, [acceptedFriends, setfriends]);

  const { active: activeTab, setActive: setActiveTab } = useActive();
  const [resourceError, setresourceError] = useState(postError);
  if (resourceError !== "") {
    return (
      <Welcome setresourceError={setresourceError} postError={resourceError} />
    );
  } else if (expired) {
    return <Welcome setresourceError={setresourceError} expired={expired!} />;
  } else {
    return uid ? (
      <AppProvider
        friendReqCount={friendReqCount}
        acceptedFriends={acceptedFriends}
        isFriendEmpty={isFriendEmpty}
        lastPullTimestamp={lastPullTimestamp}
        UnReadNotiCount={UnReadNotiCount}
        active={activeTab!}
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
        <Header
          tabIndex={activeTab === "/" ? 0 : -1}
          indicatorRef={indicatorRef}
        />
        <Tabs indicatorRef={indicatorRef} />
        <audio
          style={{ visibility: "hidden", display: "none" }}
          ref={soundRef}
          src={friendReqSound}
        />
        <SecondaryPage queryPageData={queryPageData} token={token} />
      </AppProvider>
    ) : (
      <Spinner fullScreen navBar={false} />
    );
  }
}
