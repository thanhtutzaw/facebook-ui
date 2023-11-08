import { AuthErrorCodes, getAuth, onAuthStateChanged } from "firebase/auth";
import {
  arrayUnion,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useContext, useEffect, useState } from "react";
import Header from "../components/Header/Header";
import Tabs from "../components/Tabs/Tabs";
import { Welcome } from "../components/Welcome";
import { AppProvider } from "../context/AppContext";
import {
  app,
  db,
  fethUserDoc,
  getCollectionPath,
  getNewsFeed,
  getPath,
  getPostWithMoreInfo,
  getProfileByUID,
  userToJSON,
} from "../lib/firebase";
import { getUserData, verifyIdToken } from "../lib/firebaseAdmin";
import { AppProps, account, friends } from "../types/interfaces";

import SecondaryPage from "@/components/QueryPage";
import { useActive } from "@/hooks/useActiveTab";
import { fetchRecentPosts } from "@/lib/firestore/post";
import { checkPhotoURL } from "@/lib/firestore/profile";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import Spinner from "../components/Spinner";
import { PageContext, PageProps } from "../context/PageContext";
import { MYPOST_LIMIT } from "../lib/QUERY_LIMIT";
export const getServerSideProps: GetServerSideProps<AppProps> = async (
  context
) => {
  let expired = true;
  let tokenUID;
  let queryPageData = null;
  try {
    const cookies = nookies.get(context);
    const token = await verifyIdToken(cookies.token);
    expired = !token;
    const userQuery = context.query.user!;
    if (userQuery) {
      const user = await fethUserDoc(userQuery);
      const isFriendsQuery = doc(
        db,
        `${getCollectionPath.friends({ uid: token.uid })}/${userQuery}`
      );
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
        getPath("posts", { uid: String(userQuery) }),
        where("visibility", "in", ["Public"]),
        orderBy("createdAt", "desc"),
        limit(MYPOST_LIMIT + 1)
      );
      if (isFriend) {
        mypostQuery = query(
          getPath("posts", { uid: String(userQuery) }),
          where("visibility", "in", ["Friend", "Public"]),
          orderBy("createdAt", "desc"),
          limit(MYPOST_LIMIT + 1)
        );
      }

      if (user.exists() && !expired) {
        const profile = user?.data().profile as account["profile"];
        const myPost = isBlocked
          ? null
          : await getPostWithMoreInfo(userQuery as string, mypostQuery);
        queryPageData = {
          profile,
          myPost,
          friendStatus: {
            isFriend,
            isBlocked,
            isPending,
            canAccept,
            canUnBlock,
          },
        };
      } else {
        queryPageData = null;
      }
      console.log(
        `user query page(I can fetch user data for userQuery Page)`,
        userQuery
      );
    }
    const convertSecondsToTime = (seconds: number) => {
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      return { days, hours, minutes, seconds: remainingSeconds };
    };
    // console.log(convertSecondsToTime(token.exp));
    const { uid } = token;
    tokenUID = uid;
    const myFriendsQuery = query(
      getPath("friends", { uid }),
      where("status", "==", "friend"),
      orderBy("updatedAt", "desc")
    );
    const myFriendsSnap = await getDocs(myFriendsQuery);
    const acceptedFriends = myFriendsSnap.docs.map((doc) => doc.id);
    // const feedUser = myFriendsSnap.docs.map((doc) => {
    //   return { id: doc.data().id } as { id: string };
    // });
    // const userPostsSubCollectionRef =  getPath("friends",{uid});

    // Reference to the "recentPostSubCollection" subcollection within the user's "postsSubCollection"
    // const newsFeedQuery = DescQuery(
    //   getPath("recentPosts", { uid }),
    //   NewsFeed_LIMIT + 1
    // );
    let { recentPosts, hasMore } = await fetchRecentPosts(uid);
    const [newsFeedPosts, profileData, currentAccount] = await Promise.all([
      getNewsFeed(uid, recentPosts),
      getProfileByUID(uid),
      getUserData(uid),
    ]);
    const fcmToken = (await fethUserDoc(uid)).data()?.fcmToken ?? null;
    const profile = {
      ...profileData,
      photoURL: checkPhotoURL(profileData.photoURL),
    };
    const currentUserData = userToJSON(currentAccount);

    context.res.setHeader(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate=59"
    );
    return {
      props: {
        hasMore,
        queryPageData,
        token,
        expired: expired,
        uid,
        posts: newsFeedPosts,
        profile,
        account: currentUserData ?? null,
        postError: "",
        acceptedFriends,
        fcmToken,
      },
    };
  } catch (error: any) {
    // expired = !error.code
    expired =
      error.code === "auth/argument-error" ||
      error.code === "auth/id-token-expired";
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
  postError,
  expired,
  uid,
  posts,
  profile,
  account,
  fcmToken,
  hasMore,
}: AppProps) {
  const router = useRouter();
  const auth = getAuth(app);
  const [profileSrc, setprofileSrc] = useState(
    String(profile?.photoURL) ?? "public/assets/avatar_placeholder.png"
  );
  useEffect(() => {
    if (profile) {
      setprofileSrc(String(profile.photoURL));
    }
  }, [profile]);

  const {
    notiPermission,
    newsFeedData,
    setnewsFeedData,
    setfriends,
    setnotiPermission,
  } = useContext(PageContext) as PageProps;

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
    if (!expired) setlimitedPosts(posts!);
  }, [expired, posts]);
  useEffect(() => {
    if (expired) return;
    if (!uid) {
      // router.push("/login");
    }
  }, [expired, uid]);
  useEffect(() => {
    const isReady = async () => {
      await navigator.serviceWorker.ready;
    };
    isReady();
    if (!notiPermission) return;
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // navigator.serviceWorker.ready
      //   .then((reg) => {
      //     console.log("sw ready", reg);
      //     alert("Sw ready");
      //     reg.showNotification(notificationTitle, notificationOptions);
      //   })
      const messaging = getMessaging(app);
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground push notification received:", payload);
        const { title, body, icon } = payload.notification!;
        const notificationTitle = title ?? "Facebook";

        const notificationOptions = {
          body: body ?? "Notifications from facebook .",
          icon: icon ?? "/logo.svg",
        };
        console.log(
          `serviceWorker in navigator ${"serviceWorker" in navigator}`
        ); // true
        console.log(navigator.serviceWorker);

        console.log("Before showNotification code");
        navigator.serviceWorker.ready.then((registration) => {
          console.log("Inside showNotification code");
          //this code didn't run
          registration.showNotification(notificationTitle, notificationOptions);
        });
        console.log("After showNotification code");
        new Notification(notificationTitle, notificationOptions);
        // this line only work in Desktop but actions are not allowed

        // if (
        //   "serviceWorker" in navigator &&
        //   navigator.serviceWorker.controller
        // ) {
        //   navigator.serviceWorker.controller.postMessage({
        //     type: "showNotification",
        //     title: notificationTitle,
        //     options: notificationOptions,
        //   });
        // } else {
        //   alert("noti can't show");
        // }
        // new ServiceWorkerRegistration().showNotification(
        //   notificationTitle,
        //   notificationOptions
        // );
        return () => {
          if (unsubscribe) unsubscribe();
        };
      });
    }
  }, [notiPermission]);
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
  const [UnReadNotiCount, setUnReadNotiCount] = useState(0);

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
            // const shouldStoreNewDeviceToken = fcmToken?.includes(token);
            // if (shouldStoreNewDeviceToken) return;

            // await updateDoc(userDoc, { fcmToken: arrayUnion(token) });

            const isTokenStored = fcmToken?.includes(token);
            if (!isTokenStored) {
              const userDoc = doc(db, getCollectionPath.users({ uid }));

              await updateDoc(userDoc, { fcmToken: arrayUnion(token) });

              console.log("stored token to db");
            }
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
    setfriends?.(acceptedFriends);
  }, [acceptedFriends, setfriends]);

  const { active: activeTab } = useActive();
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
        setprofileSrc={setprofileSrc}
        profileSrc={profileSrc}
        token={token}
        hasMore={hasMore}
        acceptedFriends={acceptedFriends}
        UnReadNotiCount={UnReadNotiCount}
        setUnReadNotiCount={setUnReadNotiCount}
        active={activeTab!}
        postError={postError!}
        limitedPosts={limitedPosts!}
        setlimitedPosts={setlimitedPosts!}
        profile={profile!}
        expired={expired}
        uid={uid}
        posts={posts}
        account={account}
      >
        <Header tabIndex={activeTab === "/" ? 0 : -1} />
        <Tabs />
        <SecondaryPage queryPageData={queryPageData} token={token} />
      </AppProvider>
    ) : (
      <Spinner fullScreen navBar={false} />
    );
  }
}
