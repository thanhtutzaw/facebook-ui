import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import Image from "next/image";
import router, { useRouter } from "next/router";
import nookies from "nookies";
import { useCallback, useContext, useState } from "react";
import BackHeader from "../../components/Header/BackHeader";
import { PostList } from "../../components/Sections/Home/PostList";
import s from "../../components/Sections/Profile/index.module.scss";
import { LIMIT } from "../../context/AppContext";
import { PageContext, PageProps } from "../../context/PageContext";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { db, fethUserDoc, getPostWithMoreInfo } from "../../lib/firebase";
import { verifyIdToken } from "../../lib/firebaseAdmin";
import { Post as PostType, account, friends } from "../../types/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "@tanstack/react-query";
import {
  faCheck,
  faClock,
  faPlus,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { acceptFriends, addFriends } from "../../lib/firestore/friends";
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
      isBlock = false,
      isPending = false,
      canAccept = false;
    if (friendDoc.exists()) {
      // console.log(object);
      const relation = friendDoc.data() as friends;
      isFriend = relation.status === "friend" || friendDoc.exists();
      isPending = relation.status === "pending";
      isBlock = relation.status === "block";
      canAccept = relation.senderId !== token.uid;
    }
    // const relation = friendDoc.data() as friends;
    // isBlock = relation.status === "block";

    let mypostQuery = query(
      collection(db, `/users/${uid}/posts`),
      where("visibility", "in", ["Public"]),
      orderBy("createdAt", "desc"),
      limit(LIMIT)
    );
    if (isFriend) {
      mypostQuery = query(
        collection(db, `/users/${uid}/posts`),
        where("visibility", "in", ["Friend", "Public"]),
        orderBy("createdAt", "desc"),
        limit(LIMIT)
      );
    }
    const myPost = isBlock
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
          isBlock,
          isPending,
          canAccept,
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
  isBlock,
  isPending,
  canAccept,
}: {
  token: DecodedIdToken;
  profile: account["profile"];
  myPost: PostType[];
  isFriend: Boolean;
  isBlock: Boolean;
  isPending: Boolean;
  canAccept: Boolean;
}) {
  const queryClient = useQueryClient();
  const statusComponents = {
    canAccept: (
      <button
        onClick={async () => {
          const data = {
            id: router.query.user,
          } as friends;
          await acceptFriends(token.uid, data);
          router.replace("/", undefined, { scroll: false });
          queryClient.refetchQueries(["pendingFriends"]);
          queryClient.invalidateQueries(["pendingFriends"]);
        }}
        className={`${s.editToggle} ${s.secondary}`}
      >
        <FontAwesomeIcon icon={faCheck} />
        Accept
      </button>
    ),
    friend: (
      <button
        // onClick={() => {
        //   router.push(`/chat/${router.query.user}`);
        // }}
        className={s.editToggle}
      >
        <FontAwesomeIcon icon={faCheck} />
        Friends
      </button>
    ),
    notFriend: (
      <button
        onClick={async () => {
          // router.push(`/chat/${router.query.user}`);
          const data = {
            id: router.query.user,
          } as friends;
          await addFriends(token.uid, data);
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
      <button
        // onClick={() => {
        //   router.push(`/chat/${router.query.user}`);
        // }}
        className={`${s.editToggle} ${s.pending}`}
      >
        <FontAwesomeIcon icon={faClock} />
        Pending
      </button>
    ),
  };
  const router = useRouter();
  const { setview } = useContext(PageContext) as PageProps;
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
        limit(LIMIT)
      );
      const finalPost = await getPostWithMoreInfo(token.uid!, mypostQuery)!;
      setlimitedPosts(limitedPosts?.concat(finalPost!));
      setpostLoading(false);

      if (finalPost?.length! < LIMIT) {
        setPostEnd(true);
      }
    },
    [limitedPosts, router.query.user, token?.uid]
  );
  const { scrollRef } = useInfiniteScroll(fetchMorePosts, postEnd, true);
  const bio = profile?.bio === "" || !profile ? "No Bio Yet" : profile?.bio;
  const otherUser = token?.uid !== router.query.user;
  const status = isPending
    ? "pending"
    : isFriend
    ? "friend"
    : !canAccept
    ? "notFriend"
    : "canAccept";
  return (
    <div ref={scrollRef} className="user">
      <BackHeader
        onClick={() => {
          router.push("/");
        }}
      />
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
              marginTop: "0",
            }}
            className={s.bio}
          >
            {bio}
          </p>
          {isBlock ? (
            <p style={{ color: "red" }}>This Account is Blocked </p>
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
  );
}
