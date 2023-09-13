import {
  faCheck,
  faClock,
  faPlus,
  faUser,
  faUserFriends,
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
import Image from "next/image";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useCallback, useContext, useState } from "react";
import BackHeader from "../../components/Header/BackHeader";
import { PostList } from "../../components/Sections/Home/PostList";
import s from "../../components/Sections/Profile/index.module.scss";
import { PageContext, PageProps } from "../../context/PageContext";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { MYPOST_LIMIT } from "../../lib/QUERY_LIMIT";
import { db, fethUserDoc, getPostWithMoreInfo } from "../../lib/firebase";
import { verifyIdToken } from "../../lib/firebaseAdmin";
import { acceptFriends, addFriends } from "../../lib/firestore/friends";
import { Post as PostType, account, friends } from "../../types/interfaces";
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
      canAccept = false;
    if (friendDoc.exists()) {
      const relation = friendDoc.data() as friends;
      isFriend = relation.status === "friend";
      isPending = relation.status === "pending";
      isBlocked = relation.status === "block";
      canAccept = relation.senderId !== token.uid;
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
}: {
  token: DecodedIdToken;
  profile: account["profile"];
  myPost: PostType[];
  isFriend: Boolean;
  isBlocked: Boolean;
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
          await acceptFriends(token.uid, data, currentUser);
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
        style={
          {
            // position: "relative",
          }
        }
        className={s.editToggle}
      >
        <div>
          <FontAwesomeIcon icon={faUser} />
          <FontAwesomeIcon
            style={{
              width: "10px",
              position: "relative",
              top: "-5px",
              // left: "-5px",
            }}
            icon={faCheck}
          />
        </div>
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
            }}
            className={s.bio}
          >
            {bio}
          </p>
          {isBlocked ? (
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
