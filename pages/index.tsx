import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import {
  AuthErrorCodes,
  Unsubscribe,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import {
  Timestamp,
  collection,
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
import { useContext, useEffect, useRef, useState } from "react";
import Header from "../components/Header/Header";
import Tabs from "../components/Tabs/Tabs";
import { Welcome } from "../components/Welcome";
import { AppProvider, LIMIT } from "../context/AppContext";
import {
  app,
  db,
  getNewsFeed,
  getProfileByUID,
  userToJSON,
} from "../lib/firebase";
import { getUserData, verifyIdToken } from "../lib/firebaseAdmin";
import friendReqSound from "../public/NotiSounds/chord.mp3";
import { Props } from "../types/interfaces";

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import useSound from "use-sound";
import Spinner from "../components/Spinner";
import { PageContext, PageProps } from "../context/PageContext";
import { useActive } from "../hooks/useActiveTab";
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;
    // console.log(token.uid + " in index");

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
    // await getFCMToken(uid);
    const myFriendsQuery = query(
      collection(db, `users/${uid}/friends`),
      where("status", "==", "friend"),
      orderBy("updatedAt", "desc")
    );
    const myFriendsSnap = await getDocs(myFriendsQuery);
    const acceptedFriends = myFriendsSnap.docs.map((doc) => doc.id);
    const feedUser = myFriendsSnap.docs.map((doc) => {
      const feedUser = { id: doc.data().id };
      return feedUser as { id: string };
    });
    const feedUserWithAdmin = [{ id: uid }, ...feedUser];
    console.log(feedUserWithAdmin);
    const recentPosts = await Promise.all(
      feedUserWithAdmin.map(async (friend) => {
        // const { id: friendId, updatedAt: acceptedDate } = doc.data();
        // console.log(friendId);
        const recentPostQuery = query(
          collection(db, `users/${uid}/friends/${friend.id}/recentPosts`),
          orderBy("createdAt", "desc"),
          limit(LIMIT)
        );
        return (await getDocs(recentPostQuery)).docs.map((doc) => {
          const authorId = doc.ref.parent.parent?.id;
          return {
            ...doc.data(),
            authorId,
          };
        });
      })
    );
    // console.log(friendsDoc.reduce);
    const posts = recentPosts.reduce((acc, cur) => acc.concat(cur), []);
    // console.log(posts);
    const newsFeedWithMe = [...acceptedFriends, uid];
    const isFriendEmpty = myFriendsSnap.empty;
    // console.log(acceptedFriends2);
    const friendsList = !isFriendEmpty ? newsFeedWithMe : [uid];
    // const data = await Promise.all(
    //   acceptedFriends2.map(async ({ id, updatedAt }) => {
    //     // console.log(id);
    //     const postQuery = query(
    //       collection(db, `users/${id}/posts`),
    //       where("visibility", "in", ["Friend", "Public"]),
    //       orderBy("createdAt", "desc"),
    //       limit(10)
    //     );
    //     const ddocs = await getDocs(postQuery)
    //     return await Promise.all(
    //       ddocs.docs.map(async (doc) => doc.id)
    //     );
    //   })
    // );
    // console.log(data);
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
    let expired = false;
    // const postQuery = query(
    //   collectionGroup(db, `posts`),
    //   where("authorId", "in", friendsList),
    //   // where("visibility", "in", ["Friend", "Public"]),
    //   where("updatedAt", ">=", new Timestamp(1693409835, 2000000)),
    //   orderBy("createdAt", "desc"),
    //   limit(10)
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
    //   limit(1)
    // );

    const [newsFeedPosts, profileData, currentAccount] = await Promise.all([
      getNewsFeed(uid, posts),
      // getPostWithMoreInfo(uid, postQuery),
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
    // context.res.setHeader(
    //   "Cache-Control",
    //   "public, s-maxage=10, stale-while-revalidate=59"
    // );
    return {
      props: {
        expired,
        uid,
        posts: newsFeedPosts,
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
    console.log("SSR Error in index " + error);
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
  const [friendReqCount, setfriendReqCount] = useState(0);
  const [prevfriendReqCount, setprevfriendReqCount] = useState(0);
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

  // useEffect(() => {
  //   let unsubscribe: Unsubscribe;
  //   // const postQuery = query(
  //   //   collectionGroup(db, `posts`),
  //   //   where("visibility", "in", ["Friend", "Public"]),

  //   //   orderBy("createdAt", "desc"),
  //   //   limit(limitedPosts.length > 0 ? limitedPosts.length : LIMIT)
  //   // );
  //   const postQuery = query(
  //     collectionGroup(db, `posts`),
  //     // where("visibility", "in", ["Friend", "Public"]),
  //     where("authorId", "in", !isFriendEmpty ? acceptedFriends : [uid]),
  //     orderBy("createdAt", "desc"),
  //     limit(limitedPosts.length > 0 ? limitedPosts.length : LIMIT)
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
      router.push("/login");
    }
  }, [expired, router, uid]);
  const [UnReadNotiCount, setUnReadNotiCount] = useState(0);
  // const [friendReqLastPull, setfriendReqLastPull] = useState(Date.now);
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
  // const messaging = getMessaging(app);
  // const messagingRef = useRef(null);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // console.log(await navigator.serviceWorker.controller);
        console.log("Notification permission granted.");
        return true;
      } else {
        console.log("Notification permission denied.");
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  // if (messagingRef.current) {
  //   onMessage(messagingRef?.current!, (message) => {
  //     console.log("Received message:", message);
  //   });
  // }
  useEffect(() => {
    if (
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      const messaging = getMessaging(app);

      const isAllowedNoti = requestNotificationPermission();
      const getFCMToken = async () => {
        try {
          const token = await getToken(messaging, {
            vapidKey:
              "BJPHa_aNR1GtwaZB8Wg1KDStszJikoSxmLm_xs2c3e001R6yCy4SkoLQZ-rRLicS2kB__aACT55g1Ep4njxacOE",
          });
          if (token) {
            console.log("FCM token:", token);
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
  }, []);
  useEffect(() => {
    // async function isAllowedNoti() {
    //   return await requestNotificationPermission();
    // }
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const messaging = getMessaging(app);
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground push notification received:", payload);
        // Handle the received push notification while the app is in the foreground
        // You can display a notification or update the UI based on the payload
        const notificationTitle = payload?.notification?.title ?? "Facebook";
        const notificationOptions = {
          body: payload?.notification?.body ?? "Notifications from facebook .",
          icon: "/logo.svg",
        };
        navigator.serviceWorker.ready.then((reg) =>
          reg.showNotification(notificationTitle, notificationOptions)
        );
        new Notification(notificationTitle, notificationOptions);
      });
      return () => {
        unsubscribe(); // Unsubscribe from the onMessage event
      };
    }
  }, []);
  useEffect(() => {
    if (!uid) return;
    const friendReqCountRef = doc(db, `users/${uid}/friendReqCount/reqCount`);
    let lastPull: Timestamp | null = null;
    async function getLastpull() {
      lastPull = (await getDoc(friendReqCountRef)).data()
        ?.lastPullTimestamp as Timestamp;
      // console.log();
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
              if (updatedAt > Date.now()) {
                soundRef.current
                  ?.play()
                  .then(() => {
                    soundRef.current?.play();
                    console.log("allow");
                    // playFriendRequest();
                  })
                  .catch(() => {
                    soundRef.current?.pause();
                    console.log(
                      "Audio autoplay not allowed (Try app at HomeScreen)"
                    );
                  });
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
            setprevfriendReqCount(newCount);
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
  const { setfriends } = useContext(PageContext) as PageProps;
  useEffect(() => {
    setfriends?.(acceptedFriends);
  }, [acceptedFriends, setfriends]);

  const { active, setActive } = useActive();

  if (expired) return <Welcome postError={postError} expired={expired} />;
  return uid ? (
    <AppProvider
      friendReqCount={friendReqCount}
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
      <Header tabIndex={active === "/" ? 0 : -1} indicatorRef={indicatorRef} />
      <audio
        style={{ visibility: "hidden", display: "none" }}
        ref={soundRef}
        src={friendReqSound}
      />

      <Tabs indicatorRef={indicatorRef} />
    </AppProvider>
  ) : (
    <Spinner fullScreen navBar={false} />
  );
}
