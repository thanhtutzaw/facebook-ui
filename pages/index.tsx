import { AuthErrorCodes, onAuthStateChanged } from "firebase/auth";
import {
  arrayUnion,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useEffect, useState } from "react";
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
  getProfileByUID,
  userToJSON,
} from "../lib/firebase";
import { getUserData, verifyIdToken } from "../lib/firebaseAdmin";
import { AppProps, Post, account, friends } from "../types/interfaces";

import SecondaryPage from "@/components/QueryPage";
import { useActiveTab } from "@/hooks/useActiveTab";
import { fetchMyPosts, fetchRecentPosts } from "@/lib/firestore/post";
import { checkPhotoURL } from "@/lib/firestore/profile";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { FirebaseError } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import Spinner from "../components/Spinner";
import { usePageContext } from "../context/PageContext";
type IndexProps = {
  expired: boolean;
  tokenUID: string;
  queryPageData: unknown;
  token: DecodedIdToken | null;
  postError: string;
  hasMore: boolean;
  uid: string;
  acceptedFriends: string[];
  posts: Post[];
  fcmToken: string[];
  profile: account["profile"] | null;
  account: null;
};
export const getServerSideProps: GetServerSideProps<IndexProps> = async (context) => {
  const initialProps: IndexProps = {
    expired: true,
    uid: "",
    tokenUID: "",
    postError: "",
    queryPageData: null,
    token: null,
    acceptedFriends: [],
    posts: [],
    fcmToken: [],
    profile: null,
    account: null,
    hasMore: false,
  };
  function updateInitialProps(
    data: Partial<typeof initialProps>
  ): typeof initialProps {
    return {
      ...initialProps,
      ...(data ? data : {}),
    };
  }
  let queryPageData = null;

  try {
    const cookies = nookies.get(context);
    console.log({ "cookiesCheck(old)": cookies });
    const token = await verifyIdToken(cookies.token);
    initialProps.token = token;
    console.log({
      ExpireAfterVerifyTokenSSR: new Date(token.exp * 1000).toLocaleString(),
    });
    const nowInSeconds = Math.floor(Date.now() / 1000);
    console.log({ tokenExp: token.exp, nowInSeconds });
    if (token.exp <= nowInSeconds) {
      console.log("Token has expired");
    }
    initialProps.expired = !token;
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

      if (user.exists() && !initialProps.expired) {
        const profile = user?.data().profile as account["profile"];

        const { myPost, hasMore } = await fetchMyPosts(
          String(userQuery),
          isFriend,
          isBlocked,
          token
        );
        queryPageData = {
          hasMore,
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
    const { uid } = token;
    initialProps.tokenUID = uid;
    const myFriendsQuery = query(
      getPath("friends", { uid }),
      where("status", "==", "friend"),
      orderBy("updatedAt", "desc")
    );
    const myFriendsSnap = await getDocs(myFriendsQuery);
    const acceptedFriends = myFriendsSnap.docs.map((doc) => doc.id);
    const { recentPosts, hasMore } = await fetchRecentPosts(uid);
    const [newsFeedPosts, profileData, currentAccount] = await Promise.all([
      getNewsFeed(uid, recentPosts),
      getProfileByUID(uid),
      getUserData(uid),
    ]);
    initialProps.posts = newsFeedPosts ?? [];
    initialProps.hasMore = hasMore;
    const fcmToken = (await fethUserDoc(uid)).data()?.fcmToken;
    const profile = profileData
      ? {
          ...profileData,
          photoURL: checkPhotoURL(profileData.photoURL),
        }
      : null;

    const currentUserData = userToJSON(currentAccount);
    context.res.setHeader(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate=59"
    );
    return {
      props: {
        ...initialProps,
        queryPageData,
        uid,
        acceptedFriends,
        fcmToken,
        profile,
        account: currentUserData,
      },
    };
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
      initialProps.expired =
        error.code === "auth/argument-error" ||
        error.code === "auth/id-token-expired";

      console.error({ "SSR Error in index.tsx": error });
      // console.log("SSR ErrorCode in index.tsx " + error.code);
      initialProps.postError =
        error.code === "resource-exhausted" ? error.message : "";

      if (error.code === "resource-exhausted") {
        console.error(AuthErrorCodes.QUOTA_EXCEEDED);
        console.error("Resource Error : " + error);
      }
    }
    // context.res.writeHead(302, { Location: "/login" });
    // context.res.end();
    return {
      props: {
        ...initialProps,
        uid: initialProps.tokenUID ?? "",
      },
    };
  }
};

export default function Index({
  queryPageData,
  token,
  acceptedFriends,
  postError,
  expired,
  uid,
  posts,
  profile,
  fcmToken,
  hasMore,
}: IndexProps) {
  const router = useRouter();
  const [profileSrc, setprofileSrc] = useState(
    String(profile?.photoURL) ?? "public/assets/avatar_placeholder.png"
  );
  useEffect(() => {
    if (profile) {
      setprofileSrc(String(profile.photoURL));
    }
  }, [profile]);

  const { newsFeedData, setnewsFeedData, setfriends, auth } = usePageContext();
  const [notiPermission, setnotiPermission] = useState(false);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        console.log("redirected to login ");
      } else {
        if (!expired) return;
        router.push("/");
        console.log("redirected to / ");
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, expired]);
  const [newsFeedPost, setnewsFeedPost] = useState(posts ?? []);
  // console.log("running in index.tsx");
  useEffect(() => {
    if (posts && !newsFeedData) {
      setnewsFeedData?.(posts);
    }
  }, [newsFeedData, posts, setnewsFeedData]);

  useEffect(() => {
    if (!expired) setnewsFeedPost(posts!);
  }, [expired, posts]);
  // useEffect(() => {
  //   console.error("should not run");
  // }, [expired, uid]);
  useEffect(() => {
    const isReady = async () => {
      await navigator.serviceWorker.ready;
    };
    isReady();
    if (!notiPermission) return;
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const messaging = getMessaging(app);
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground push notification received:", payload);
        const { title, body, image, icon } = payload.notification!;
        const options = {
          body,
          icon,
          image,
        };
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title!, options);
        });
        new Notification(title!, options);
        // this line only work in Desktop but actions are not allowed

        return () => {
          if (unsubscribe) unsubscribe();
        };
      });
    }
  }, [notiPermission]);
  useEffect(() => {
    if (!token) return;
    const requestNotificationPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setnotiPermission?.(true);
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
  }, [setnotiPermission, token]);
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

  const { active: activeTab } = useActiveTab();
  const [resourceError, setresourceError] = useState(postError);
  if (resourceError !== "") {
    return (
      <Welcome setresourceError={setresourceError} postError={resourceError} />
    );
  } else if (expired) {
    return <Welcome setresourceError={setresourceError} expired={expired} />;
  } else {
    return uid ? (
      <AppProvider
        token={token}
        setprofileSrc={setprofileSrc}
        profileSrc={profileSrc}
        active={activeTab}
        setnewsFeedPost={setnewsFeedPost}
        newsFeedPost={newsFeedPost}
        uid={uid}
        posts={posts}
        hasMore={hasMore}
        // UnReadNotiCount={UnReadNotiCount}
        // setUnReadNotiCount={setUnReadNotiCount}
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
