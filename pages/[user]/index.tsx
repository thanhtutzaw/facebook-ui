import {
  faCheck,
  faClock,
  faPlus,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "@tanstack/react-query";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useCallback, useContext, useState } from "react";
import BackHeader from "@/components/Header/BackHeader";
import s from "@/components/Tabs/Sections/Profile/index.module.scss";
import { PageContext, PageProps } from "@/context/PageContext";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { MYPOST_LIMIT } from "@/lib/QUERY_LIMIT";
import { db, fethUserDoc, getPostWithMoreInfo } from "@/lib/firebase";
import { verifyIdToken } from "@/lib/firebaseAdmin";
import {
  acceptFriends,
  addFriends,
  unBlockFriend,
} from "@/lib/firestore/friends";
import { Post as PostType, account, friends } from "@/types/interfaces";
import { PostList } from "@/components/Tabs/Sections/Home/PostList";
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const uid = context.query.user!;
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;
    const user = await fethUserDoc(uid);
    const userExist = user.exists();
    const isFriendsQuery = doc(db, `users/${token.uid}/friends/${uid}`);
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
      collection(db, `/users/${uid}/posts`),
      where("visibility", "in", ["Public"]),
      orderBy("createdAt", "desc"),
      limit(MYPOST_LIMIT)
    );
    if (isFriend) {
      mypostQuery = query(
        collection(db, `/users/${uid}/posts`),
        where("visibility", "in", ["Friend", "Public"]),
        orderBy("createdAt", "desc"),
        limit(MYPOST_LIMIT)
      );
    }
    const myPost = isBlocked
      ? null
      : await getPostWithMoreInfo(uid as string, mypostQuery);
    if (userExist) {
      const profile = user?.data().profile as account["profile"];
      return {
        props: {
          token,
          profile: profile ?? null,
          myPost,
          isFriend,
          isBlocked,
          isPending,
          canAccept,
          canUnBlock,
        },
      };
    } else {
      return {
        notFound: true,
      };
    }
  } catch (error) {
    console.log("SSR Error " + error);
    context.res.writeHead(302, { Location: "/login" });
    context.res.end();
    return {
      props: {
        token: null,
        profile: [],
        myPost: [],
      },
    };
  }
};

export default function UserProfile({
  token,
  profile,
  myPost,
  isFriend,
  isBlocked,
  isPending,
  canAccept,
  canUnBlock,
}: {
  token: DecodedIdToken;
  profile: account["profile"];
  myPost: PostType[];
  isFriend: Boolean;
  isBlocked: Boolean;
  isPending: Boolean;
  canAccept: Boolean;
  canUnBlock: Boolean;
}) {
  const queryClient = useQueryClient();
  const statusComponents = {
    canAccept: (
      <button
        onClick={async () => {
          const data = {
            id: router.query.user,
          } as friends;
          await acceptFriends(token.uid, data, currentUser);
          router.replace("/", undefined, { scroll: false });
          queryClient.refetchQueries(["pendingFriends"]);
          queryClient.invalidateQueries(["pendingFriends"]);
        }}
        className={`${s.editToggle} ${s.confirm}`}
      >
        <FontAwesomeIcon icon={faCheck} />
        Accept
      </button>
    ),
    friend: (
      <button
        style={
          {
            // position: "relative",
          }
        }
        className={s.editToggle}
      >
        <svg
          width="20"
          data-e2e=""
          height="20"
          viewBox="0 0 48 48"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M13.0001 13C13.0001 9.68629 15.6864 7 19.0001 7C22.3139 7 25.0001 9.68629 25.0001 13C25.0001 16.3137 22.3139 19 19.0001 19C15.6864 19 13.0001 16.3137 13.0001 13ZM19.0001 3C13.4773 3 9.00015 7.47715 9.00015 13C9.00015 18.5228 13.4773 23 19.0001 23C24.523 23 29.0001 18.5228 29.0001 13C29.0001 7.47715 24.523 3 19.0001 3ZM5.19435 40.9681C6.70152 35.5144 10.0886 32.2352 13.9162 30.738C17.7125 29.2531 22.0358 29.4832 25.6064 31.2486C26.1015 31.4934 26.7131 31.338 26.9931 30.8619L28.0072 29.1381C28.2872 28.662 28.1294 28.0465 27.6384 27.7937C23.0156 25.4139 17.4034 25.0789 12.4591 27.0129C7.37426 29.0018 3.09339 33.3505 1.2883 40.0887C1.14539 40.6222 1.48573 41.1592 2.02454 41.2805L3.97575 41.7195C4.51457 41.8408 5.04724 41.5004 5.19435 40.9681ZM44.7074 30.1212C45.0979 29.7307 45.0979 29.0975 44.7074 28.707L43.2932 27.2928C42.9026 26.9023 42.2695 26.9023 41.8789 27.2928L30.0003 39.1715L25.1216 34.2928C24.7311 33.9023 24.0979 33.9023 23.7074 34.2928L22.2932 35.707C21.9026 36.0975 21.9026 36.7307 22.2932 37.1212L28.586 43.4141C29.3671 44.1952 30.6334 44.1952 31.4145 43.4141L44.7074 30.1212Z"
          ></path>
        </svg>
        {/* <div>
          <FontAwesomeIcon icon={faUser} />
          <FontAwesomeIcon
            style={{
              width: "10px",
              position: "relative",
              top: "-5px",
            }}
            icon={faCheck}
          />
        </div> */}
        Friends
      </button>
    ),
    notFriend: (
      <button
        onClick={async () => {
          const data = {
            id: router.query.user,
          } as friends;
          await addFriends(token.uid, data, currentUser);
          router.replace(router.asPath, undefined, { scroll: false });
          queryClient.refetchQueries(["pendingFriends"]);
          queryClient.invalidateQueries(["pendingFriends"]);
        }}
        className={`${s.editToggle} ${s.secondary}`}
      >
        <FontAwesomeIcon icon={faPlus} />
        Add Friend
      </button>
    ),
    pending: (
      <button className={`${s.editToggle} ${s.pending}`}>
        <FontAwesomeIcon icon={faClock} />
        Pending
      </button>
    ),
  };
  const router = useRouter();
  const { setview, currentUser } = useContext(PageContext) as PageProps;
  const userName = `${profile?.firstName ?? "Unknown"} ${
    profile?.lastName ?? "User"
  }`;
  const [limitedPosts, setlimitedPosts] = useState(myPost);
  const [postLoading, setpostLoading] = useState(false);
  const [postEnd, setPostEnd] = useState(false);
  const fetchMorePosts = useCallback(
    async function () {
      setpostLoading(true);
      const post = limitedPosts?.[limitedPosts?.length - 1]!;
      const date = new Timestamp(
        post.createdAt.seconds,
        post.createdAt.nanoseconds
      );
      const mypostQuery = query(
        collection(db, `/users/${router.query.user}/posts`),
        where("visibility", "in", ["Friend", "Public"]),
        orderBy("createdAt", "desc"),
        startAfter(date),
        limit(MYPOST_LIMIT)
      );
      const finalPost = await getPostWithMoreInfo(token.uid!, mypostQuery)!;
      setlimitedPosts(limitedPosts?.concat(finalPost!));
      setpostLoading(false);

      if (finalPost?.length! < MYPOST_LIMIT) {
        setPostEnd(true);
      }
    },
    [limitedPosts, router.query.user, token?.uid]
  );
  const { scrollRef } = useInfiniteScroll(fetchMorePosts, postEnd, true);
  const bio = profile?.bio === "" || !profile ? "No Bio Yet" : profile?.bio;
  const otherUser = token?.uid !== router.query.user;
  const status = canAccept
    ? "canAccept"
    : isPending
    ? "pending"
    : isFriend
    ? "friend"
    : "notFriend";
  return (
    <>
      <Head>
        <title>{`${userName} | Facebook Next`}</title>
        <meta
          name="description"
          content={`${userName} Facebook-Mobile-UI with Next.js`}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no"
        />
        <link rel="icon" href="/logo.svg" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <div ref={scrollRef} className="user">
        <BackHeader />
        <div
          style={{
            marginTop: "65px",
            height: "calc(100vh - 65px)",
            backgroundColor: "#dadada",
          }}
          className={s.container}
        >
          <div className={`${s.info}`} style={{ paddingBottom: "1rem" }}>
            <Image
              onClick={() => {
                setview?.({
                  src: profile?.photoURL
                    ? profile?.photoURL
                    : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
                  name: `${userName}'s profile`,
                });
              }}
              priority={false}
              className={s.profile}
              width={500}
              height={170}
              style={{ objectFit: "cover", width: "120px", height: "120px" }}
              alt={`${userName}'s profile`}
              src={
                (profile?.photoURL as string)
                  ? (profile?.photoURL as string)
                  : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
              }
            />
            <h3 style={{ marginBottom: "18px" }}>{userName}</h3>
            <p
              style={{
                color: profile?.bio === "" ? "gray" : "initial",
              }}
              className={s.bio}
            >
              {bio}
            </p>
            {isBlocked ? (
              <>
                <p style={{ color: "red" }}>This Account is Blocked </p>
                {canUnBlock && (
                  <>
                    <div className={s.actions}>
                      <button
                        className={s.editToggle}
                        onClick={async () => {
                          router.replace(router.asPath, undefined, {
                            scroll: false,
                          });
                          await unBlockFriend(token.uid, {
                            id: router.query.user?.toString()!,
                          });
                        }}
                      >
                        Unblock
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              otherUser && (
                <div className={s.actions}>
                  {statusComponents[status]}
                  <button
                    onClick={() => {
                      router.push(`/chat/${router.query.user}`);
                    }}
                    className={s.editToggle}
                  >
                    Send Message
                  </button>
                </div>
              )
            )}
          </div>
          <PostList
            postLoading={postLoading}
            postEnd={postEnd}
            tabIndex={1}
            posts={limitedPosts}
            profile={profile}
          />
        </div>
      </div>
    </>
  );
}
