import BackHeader from "@/components/Header/BackHeader";
import Metatag from "@/components/Metatag";
import PostList from "@/components/Tabs/Sections/Home/PostList";
import { bioFallback } from "@/components/Tabs/Sections/Profile/ProfileInfo";
import s from "@/components/Tabs/Sections/Profile/index.module.scss";
import { usePageContext } from "@/context/PageContext";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import useMenu from "@/hooks/useMenu";
import useQueryFn from "@/hooks/useQueryFn";
import { MYPOST_LIMIT } from "@/lib/QUERY_LIMIT";
import {
  DescQuery,
  db,
  fethUserDoc,
  getCollectionPath,
  getPath,
  getPostWithMoreInfo,
} from "@/lib/firebase";
import { verifyIdToken } from "@/lib/firebaseAdmin";
import {
  acceptFriends,
  addFriends,
  blockFriend,
  cancelFriendRequest,
  unBlockFriend,
  unFriend,
} from "@/lib/firestore/friends";
import { fetchMyPosts } from "@/lib/firestore/post";
import { checkPhotoURL, getFullName } from "@/lib/firestore/profile";
import { Post as PostType, account, friends } from "@/types/interfaces";
import {
  faBan,
  faClock,
  faClose,
  faPlus,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { Timestamp, doc, getDoc, startAfter, where } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import nookies from "nookies";
import confirm from "public/assets/confirm-beep.mp3";
import { ReactElement, ReactNode, useCallback, useState } from "react";
import useSound from "use-sound";
import { AcceptFriend } from "../../components/Button/AcceptFriend";

export type statusDataType = "canAccept" | "pending" | "friend" | "notFriend";
export const getServerSideProps: GetServerSideProps = async (context) => {
  let isFriend = false,
    isBlocked = false,
    isPending = false,
    canAccept = false,
    canUnBlock = false;
  try {
    const uid = context.query.user!;
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;
    const user = await fethUserDoc(uid);
    const userExist = user.exists();
    const isFriendsQuery = doc(
      db,
      `${getCollectionPath.friends({ uid: token.uid })}/${uid}`
    );
    const friendDoc = await getDoc(isFriendsQuery);

    if (friendDoc.exists()) {
      const relation = friendDoc.data() as friends;
      isFriend = relation.status === "friend";
      isPending = relation.status === "pending";
      isBlocked = relation.status === "block";
      canAccept = relation.senderId !== token.uid && !isFriend;
      canUnBlock = relation.senderId === token.uid;
    }
    const { myPost, hasMore } = await fetchMyPosts(
      uid,
      isFriend,
      isBlocked,
      token
    );
    if (userExist) {
      const profile = user?.data().profile as account["profile"];
      return {
        props: {
          token,
          hasMore,
          profile: profile ?? null,
          myPost,
          friendStatus: {
            isFriend,
            isBlocked,
            isPending,
            canAccept,
            canUnBlock,
          },
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
        hasMore: false,
        token: null,
        profile: [],
        myPost: [],
        friendStatus: {
          isFriend,
          isBlocked,
          isPending,
          canAccept,
          canUnBlock,
        },
      },
    };
  }
};

export default function UserProfile({
  hasMore,
  token,
  profile,
  myPost,
  friendStatus,
}: {
  hasMore: boolean;
  token: DecodedIdToken;
  profile: account["profile"];
  myPost: PostType[];
  friendStatus: {
    isFriend: Boolean;
    isBlocked: Boolean;
    isPending: Boolean;
    canAccept: Boolean;
    canUnBlock: Boolean;
  };
}) {
  const { queryFn } = useQueryFn();
  const router = useRouter();
  const [playAcceptSound] = useSound(confirm);
  const { isFriend, isBlocked, isPending, canAccept, canUnBlock } =
    friendStatus;
  const userName = getFullName(profile);
  const friendId = router.query.user;
  const [friendMenuToggle, setFriendMenuToggle] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    setsingleImageModal,
    singleImageModalRef,
    currentUser,
    setcurrentUser,
  } = usePageContext();

  const statusComponents = {
    canAccept: (
      <AcceptFriend
        onClick={async () => {
          if (!friendId || !currentUser) return;
          try {
            await acceptFriends(
              token.uid,
              {
                senderId: friendId?.toString(),
                id: friendId?.toString(),
                status: "pending",
              },
              currentUser
            );
            playAcceptSound();
            router.replace(router.asPath, undefined, {
              scroll: false,
            });
            setstatus("friend");
            queryFn.invalidate("pendingFriends");
            queryFn.refetchQueries("pendingFriends");
          } catch (error) {
            console.error(error);
          }
        }}
        className={`${s.editToggle} ${s.confirm}`}
      />
    ),
    friend: (
      <div style={{ position: "relative" }}>
        <button
          aria-label={`Friend with ${userName}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFriendMenuToggle((prev) => !prev);
          }}
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
          Friends
        </button>
        <Menu
          setFriendMenuToggle={setFriendMenuToggle}
          friendMenuToggle={friendMenuToggle}
        >
          <button
            aria-label="Unfriend"
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
    pending: (
      <div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFriendMenuToggle((prev) => !prev);
          }}
          className={`${s.editToggle} ${s.pending}`}
        >
          <FontAwesomeIcon icon={faClock} />
          Pending
        </button>
        <Menu
          setFriendMenuToggle={setFriendMenuToggle}
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
      setpostLoading(limitedPosts.length > MYPOST_LIMIT);
      console.log("getting more post...");
      const post = limitedPosts?.[limitedPosts?.length - 1]!;
      const date = new Timestamp(
        post.createdAt.seconds,
        post.createdAt.nanoseconds
      );
      console.log(post);
      let mypostQuery;
      if (isFriend) {
        mypostQuery = DescQuery(
          getPath("posts", { uid: String(router.query.user) }),
          MYPOST_LIMIT + 1,
          where("visibility", "in", ["Friend", "Public"]),
          startAfter(date)
        );
      } else if (router.query.user === token.uid) {
        mypostQuery = DescQuery(
          getPath("posts", { uid: String(router.query.user) }),
          MYPOST_LIMIT + 1,
          startAfter(date)
        );
      } else {
        mypostQuery = DescQuery(
          getPath("posts", { uid: String(router.query.user) }),
          MYPOST_LIMIT + 1,
          where("visibility", "==", "Public"),
          startAfter(date)
        );
      }
      const finalPost = await getPostWithMoreInfo(token.uid!, mypostQuery)!;
      finalPost?.shift();
      setlimitedPosts(limitedPosts?.concat(finalPost!));
      setpostLoading(false);
      setPostEnd(finalPost?.length! < MYPOST_LIMIT);

      // if (finalPost?.length! < MYPOST_LIMIT) {
      // }
    },
    [isFriend, limitedPosts, router.query.user, token.uid]
  );
  const { scrollRef } = useInfiniteScroll({
    hasMore,
    scrollParent: true,
    fetchMoreData: fetchMorePosts,
  });
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
      <Metatag
        url={router.pathname}
        title={`${userName} | Facebook Next`}
        description={`${userName}'s Profile | Facebook-Mobile-UI with Next.js`}
      />
      <div ref={scrollRef} className="user">
        <BackHeader style={{ zIndex: "200000" }} />
        <div
          style={{
            marginTop: "65px",
            height: "calc(100vh - 65px)",
            backgroundColor: "#dadada",
          }}
          className={s.container}
        >
          <div className={`${s.info}`}>
            <Link
              // as={encodeURIComponent(userName).replaceAll("%20", "-")}
              // as={String(router.query.user)+"/"+}
              shallow
              href={{
                pathname: String(router.query.user),
                query: {
                  viewImage: checkPhotoURL(profile?.photoURL),
                  imageName: userName,
                },
              }}
            >
              <Image
                // onClick={() => {
                //   setsingleImageModal({
                //     src: checkPhotoURL(profile?.photoURL),
                //     name: `${userName}'s profile`,
                //   });
                // }}
                className={`bg-avatarBg  ${s.profile}`}
                width={500}
                height={170}
                style={{ objectFit: "cover", width: "120px", height: "120px" }}
                alt={`${userName}'s profile`}
                src={checkPhotoURL(profile?.photoURL)}
              />
            </Link>
            <h3 className="font-semibold text-base">{userName}</h3>
            <p
              style={{
                color: profile?.bio === "" ? "gray" : "initial",
                wordBreak: "break-word",
              }}
              className={s.bio}
            >
              {bio}
            </p>
            {isBlocked ? (
              <>
                <p className={`text-red`}>This Account is Blocked </p>
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
                    <NotFriendBtn>
                      <button
                        disabled={loading}
                        key={loading ? "true" : "false"}
                        onClick={async () => {
                          if (!currentUser) return;
                          setLoading(true);
                          const data = {
                            id: String(router.query.user),
                            author: profile,
                          };
                          await addFriends(token.uid, data, currentUser);
                          router.replace(router.asPath, undefined, {
                            scroll: false,
                          });
                          queryFn.invalidate("pendingFriends");
                          setLoading(false);
                          setstatus("pending");
                        }}
                        className={`${s.editToggle} ${s.secondary}`}
                      >
                        {!loading ? (
                          <FontAwesomeIcon icon={faPlus} />
                        ) : (
                          <Spin />
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
          {/* <button
            onClick={() => {
              singleImageModalRef.current &&
                singleImageModalRef.current.showModal();
              setsingleImageModal({
                src: checkPhotoURL(profile?.photoURL),
                name: "test",
              });
            }}
          >
            Open Modal
          </button> */}
          <PostList
            postLoading={hasMore}
            postEnd={postEnd}
            tabIndex={1}
            posts={limitedPosts}
          />
          b
        </div>
      </div>
    </>
  );
}
export function Menu({
  setFriendMenuToggle,
  friendMenuToggle,
  children,
}: {
  setFriendMenuToggle: Function;
  friendMenuToggle: boolean;
  children: ReactNode;
}) {
  const { menuRef } = useMenu(friendMenuToggle, setFriendMenuToggle);

  return (
    <AnimatePresence mode="wait">
      {friendMenuToggle && (
        <motion.div
          ref={menuRef}
          className={`items-center ${s.menuContainer}`}
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
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// function Toggler(
//   children: ReactNode,
//   ...rest: DetailedHTMLProps<
//     ButtonHTMLAttributes<HTMLButtonElement>,
//     HTMLButtonElement
//   >
// ) {
//   return <button {...rest}>{children}</button>;
// }
function Spin() {
  return (
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

function NotFriendBtn(props: { children: ReactElement }) {
  const { children } = props;
  return <>{children}</>;
}
