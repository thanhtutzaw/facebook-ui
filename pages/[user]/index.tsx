import BackHeader from "@/components/Header/BackHeader";
import { PostList } from "@/components/Tabs/Sections/Home/PostList";
import { bioFallback } from "@/components/Tabs/Sections/Profile/ProfileInfo";
import s from "@/components/Tabs/Sections/Profile/index.module.scss";
import { PageContext, PageProps } from "@/context/PageContext";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { MYPOST_LIMIT } from "@/lib/QUERY_LIMIT";
import { db, fethUserDoc, getPostWithMoreInfo } from "@/lib/firebase";
import { verifyIdToken } from "@/lib/firebaseAdmin";
import {
  acceptFriends,
  addFriends,
  blockFriend,
  cancelFriendRequest,
  unBlockFriend,
  unFriend,
} from "@/lib/firestore/friends";
import { getFullName } from "@/lib/firestore/profile";
import { Post as PostType, account, friends } from "@/types/interfaces";
import {
  faBan,
  faClock,
  faClose,
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
import { AnimatePresence, motion } from "framer-motion";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import nookies from "nookies";
import {
  HtmlHTMLAttributes,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AcceptFriend } from "../../components/Button/AcceptFriend";
import { updateCurrentUser } from "firebase/auth";
export type statusDataType = "canAccept" | "pending" | "friend" | "notFriend";
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
  const router = useRouter();

  const userName = getFullName(profile);
  const friendId = router.query.user;
  const [friendMenuToggle, setFriendMenuToggle] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setview, currentUser, setcurrentUser } = useContext(
    PageContext
  ) as PageProps;

  // const updateCurrentUser = useCallback(() => {
  //   const UserWithCropped = {
  //     ...currentUser,
  //     photoURL_cropped: profile?.photoURL_cropped,
  //   };
  //   setcurrentUser?.(UserWithCropped);
  //   // console.log(currentUser);
  // }, [currentUser, profile?.photoURL_cropped, setcurrentUser]);

  // useEffect(() => {
  //   updateCurrentUser();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
  const statusComponents = {
    canAccept: (
      <AcceptFriend
        onClick={async () => {
          if (!friendId) return;
          // console.log({ currentUser });
          await acceptFriends(
            token.uid,
            {
              senderId: friendId?.toString(),
              id: friendId?.toString(),
            },
            currentUser
          );
          router.replace(router.asPath, undefined, {
            scroll: false,
          });
          setstatus("friend");
          queryClient.refetchQueries(["pendingFriends"]);
          queryClient.invalidateQueries(["pendingFriends"]);
        }}
        className={`${s.editToggle} ${s.confirm}`}
      />
    ),
    friend: (
      <div style={{ position: "relative" }}>
        <button
          aria-label={`Friend with ${userName}`}
          onClick={() => {
            setFriendMenuToggle((prev) => !prev);
          }}
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
              fillRule="evenodd"
              clipRule="evenodd"
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
        <Menu
          uid={token.uid}
          friendId={friendId?.toString()!}
          friendMenuToggle={friendMenuToggle}
        >
          <button
            aria-label="Unfriend"
            // className={s.danger}
            onClick={async (e) => {
              e.stopPropagation();
              e.preventDefault();
              router.replace(router.asPath, undefined, { scroll: false });
              setstatus("notFriend");
              await unFriend(token.uid, { id: String(friendId) });
            }}
          >
            <FontAwesomeIcon icon={faUser} />
            UnFriend
          </button>
          <button
            aria-label="Block this user"
            className={s.danger}
            onClick={async (e) => {
              e.stopPropagation();
              e.preventDefault();
              router.replace(router.asPath, undefined, { scroll: false });
              await blockFriend(token.uid, { id: String(friendId) });
            }}
          >
            <FontAwesomeIcon icon={faBan} />
            Block
          </button>
        </Menu>
      </div>
    ),
    // notFriend: (

    // ),
    pending: (
      <div>
        <button
          onClick={() => {
            setFriendMenuToggle((prev) => !prev);
          }}
          className={`${s.editToggle} ${s.pending}`}
        >
          <FontAwesomeIcon icon={faClock} />
          Pending
        </button>
        <Menu
          uid={token.uid}
          friendId={friendId?.toString()!}
          friendMenuToggle={friendMenuToggle}
        >
          <button
            aria-label="Cancel friend request"
            onClick={async (e) => {
              e.stopPropagation();
              e.preventDefault();
              await cancelFriendRequest(token.uid, { id: String(friendId) });
              router.replace(router.asPath, undefined, { scroll: false });
              setFriendMenuToggle(false);
              setstatus("notFriend");
            }}
          >
            <FontAwesomeIcon icon={faClose} />
            Cancel Request
          </button>
          <button
            aria-label="Block this user"
            className={s.danger}
            onClick={async (e) => {
              e.stopPropagation();
              e.preventDefault();
              router.replace(router.asPath, undefined, { scroll: false });
              await blockFriend(token.uid, { id: String(friendId) });
              setFriendMenuToggle(false);
            }}
          >
            <FontAwesomeIcon icon={faBan} />
            Block
          </button>
        </Menu>
      </div>
    ),
  };

  const [limitedPosts, setlimitedPosts] = useState(myPost);
  const [postLoading, setpostLoading] = useState(false);
  const [postEnd, setPostEnd] = useState(false);
  const fetchMorePosts = useCallback(
    async function () {
      setpostLoading(true);
      console.log("post loading");
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
      console.log({ limitedPosts });
      setlimitedPosts(limitedPosts?.concat(finalPost!));
      console.log({ finalPost });
      setpostLoading(false);

      if (finalPost?.length! < MYPOST_LIMIT) {
        setPostEnd(true);
      }
    },
    [limitedPosts, router.query.user, token?.uid]
  );
  const { scrollRef } = useInfiniteScroll(postEnd, true, fetchMorePosts);
  const bio = profile?.bio === "" || !profile ? bioFallback : profile?.bio;
  const otherUser = token?.uid !== router.query.user;

  const statusData: statusDataType = canAccept
    ? "canAccept"
    : isPending
    ? "pending"
    : isFriend
    ? "friend"
    : "notFriend";
  const [status, setstatus] = useState(statusData);
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
        <BackHeader style={{ zIndex: "200000" }}></BackHeader>
        <div
          style={{
            marginTop: "65px",
            height: "calc(100vh - 65px)",
            backgroundColor: "#dadada",
          }}
          className={s.container}
        >
          <div className={`${s.info}`}>
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
                // minHeight: "24px",
                wordBreak: "break-word",
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
                            senderId: token.uid,
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
                  {status === "notFriend" ? (
                    <NotFriendBtn
                      loading={loading}
                      setLoading={setLoading}
                      addFriends={addFriends}
                      currentUser={currentUser}
                      undefined={undefined}
                      setstatus={setstatus}
                      faPlus={faPlus}
                    >
                      <button
                        disabled={loading}
                        key={loading ? "true" : "false"}
                        onClick={async () => {
                          setLoading(true);
                          const data = {
                            id: router.query.user,
                          } as friends;
                          await addFriends(token.uid, data, currentUser);
                          router.replace(router.asPath, undefined, {
                            scroll: false,
                          });
                          queryClient.invalidateQueries(["pendingFriends"]);
                          setLoading(false);
                          setstatus("pending");
                        }}
                        className={`${s.editToggle} ${s.secondary}`}
                      >
                        {!loading ? (
                          <FontAwesomeIcon icon={faPlus} />
                        ) : (
                          <Spin loading={loading} />
                        )}
                        {!loading ? "Add Friend" : "Adding..."}
                      </button>
                    </NotFriendBtn>
                  ) : (
                    statusComponents[status]
                  )}
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
function Menu({
  friendMenuToggle,
  uid,
  friendId,
  children,
}: {
  friendId: string;
  uid: string;
  friendMenuToggle: boolean;
  children: ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      {friendMenuToggle && (
        <motion.div
          className={s.menuContainer}
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: friendMenuToggle ? 1 : 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
          }}
          transition={{
            duration: 0.15,
          }}
          // className={styles.actions}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Spin(props: { loading: boolean }): JSX.Element {
  const { loading } = props;
  return (
    // <Spinner
    //   key={loading ? "true" : "false"}
    //   size={18}
    //   style={{
    //     margin: "0",
    //     display: loading ? "block" : "none",
    //   }}
    //   color={"white"}
    // />
    <div className="loading" style={{ margin: "0" }}>
      <div
        className="spinner"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <div
          style={{
            width: `${18}px`,
            height: `${18}px`,
            borderTopColor: "white !important",
            borderLeftColor: "white !important",
          }}
          className="spinner-icon white"
        ></div>
      </div>
    </div>
  );
}

function NotFriendBtn(props: {
  loading: any;
  setLoading: any;
  addFriends: any;
  currentUser: any;
  undefined: any;
  setstatus: any;
  faPlus: any;
  children: any;
}) {
  const {
    loading,
    setLoading,
    addFriends,
    currentUser,
    undefined,
    setstatus,
    faPlus,
    children,
  } = props;
  return <>{children}</>;
}
