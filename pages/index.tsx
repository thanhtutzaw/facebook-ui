import { AuthErrorCodes, onAuthStateChanged } from "firebase/auth";
import {
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
import { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import Tabs from "../components/Tabs/Tabs";
import { Welcome } from "../components/Welcome";

import { AppProvider } from "../context/AppContext";
import {
  db,
  fethUserDoc,
  getCollectionPath,
  getNewsFeed,
  getPath,
  getProfileByUID,
  userToJSON,
} from "../lib/firebase";
import { getUserData, verifyIdToken } from "../lib/firebaseAdmin";
import { Post, account, friend } from "../types/interfaces";

import SecondaryPage from "@/components/QueryPage";
import { NewsFeedProvider } from "@/context/NewsFeedContext";
import { useActiveTab } from "@/hooks/useActiveTab";
import useFCMNotification from "@/hooks/useFCMNotification";
import { fetchRecentPosts, getPostsByUser } from "@/lib/firestore/post";
import { checkPhotoURL } from "@/lib/firestore/profile";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { FirebaseError } from "firebase/app";
import Spinner from "../components/Spinner";
import { usePageContext } from "../context/PageContext";
const initialProps = {
  expired: true,
  uid: "",
  tokenUID: "",
  postError: "",
  queryPageData: null as unknown,
  token: null as DecodedIdToken | null,
  acceptedFriends: [""],
  posts: [] as Post[],
  fcmToken: [""],
  profile: null as account["profile"] | null,
  account: null as UserRecord | null,
  hasMore: false,
};
type IndexProps = typeof initialProps;
export const getServerSideProps: GetServerSideProps<IndexProps> = async (
  context
) => {
  // function updateInitialProps(
  //   data: Partial<typeof initialProps>
  // ): typeof initialProps {
  //   return {
  //     ...initialProps,
  //     ...(data ? data : {}),
  //   };
  // }
  let queryPageData = null;
  console.log({ indexUserQueryCheck: context.query });
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
        const relation = friendDoc.data() as friend;
        isFriend = relation.status === "friend";
        isPending = relation.status === "pending";
        isBlocked = relation.status === "block";
        canAccept = relation.senderId !== token.uid && !isFriend;
        canUnBlock = relation.senderId === token.uid;
      }

      if (user.exists() && !initialProps.expired) {
        const profile = user?.data().profile as account["profile"];

        const { myPost, hasMore } = await getPostsByUser(
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
      console.log(`user query(secondary Page)`, userQuery);
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

    const currentUserAccount = userToJSON(currentAccount);
    // context.res.setHeader(
    //   "Cache-Control",
    //   "public, s-maxage=10, stale-while-revalidate=59"
    // );
    return {
      props: {
        ...initialProps,
        queryPageData,
        uid,
        acceptedFriends,
        fcmToken,
        profile,
        account: currentUserAccount,
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
  const { setfriends, auth } = usePageContext();
  const { active: activeTab } = useActiveTab();
  const [resourceError, setresourceError] = useState(postError);
  useFCMNotification({ token, fcmToken });
  useEffect(() => {
    if (profile) {
      setprofileSrc(String(profile.photoURL));
    }
  }, [profile]);
  useEffect(() => {
    setfriends(acceptedFriends);
  }, [acceptedFriends, setfriends]);
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
        profile={profile}
        uid={uid}
      >
        <NewsFeedProvider
          hasMore={hasMore}
          expired={expired}
          uid={uid}
          posts={posts}
        >
          <Header tabIndex={activeTab === "/" ? 0 : -1} />
          <Tabs />
        </NewsFeedProvider>
        <SecondaryPage queryPageData={queryPageData} token={token} />
      </AppProvider>
    ) : (
      <Spinner fullScreen navBar={false} />
    );
  }
}
