import {
  faBan,
  faCheck,
  faEllipsisV,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "@tanstack/react-query";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import {
  Timestamp,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useContext, useEffect, useState } from "react";
import BackHeader from "../../components/Header/BackHeader";
import Spinner from "../../components/Spinner";
import { PageContext, PageProps } from "../../context/PageContext";
import { db, getProfileByUID } from "../../lib/firebase";
import { verifyIdToken } from "../../lib/firebaseAdmin";
import {
  acceptFriends,
  blockFriend,
  cancelFriendRequest,
  rejectFriendRequest,
  unBlockFriend,
  unFriend,
} from "../../lib/firestore/friends";
import { friends } from "../../types/interfaces";
import s from "./index.module.scss";
import { AnimatePresence, motion } from "framer-motion";
import { statusDataType } from "../[user]";
import { AcceptFriend } from "../../components/Button/AcceptFriend";
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;

    const { uid } = token;
    const myFriendsQuery = query(
      collection(db, `users/${uid}/friends`),
      where("status", "==", "friend"),
      orderBy("updatedAt", "desc")
    );
    const myFriendsSnap = await getDocs(myFriendsQuery);
    const acceptedFriends = await Promise.all(
      myFriendsSnap.docs.map(async (doc) => {
        const account = await getProfileByUID(doc.id);
        // const accountJSON = userToJSON(account) as UserRecord;
        return {
          status: doc.data().status,
          senderId: doc.data().senderId,
          id: doc.id,
          author: {
            ...account,
          },
        };
      })
    );
    return {
      props: {
        uid,
        acceptedFriends,
      },
    };
  } catch (error) {
    console.log("SSR Error " + error);
    return {
      props: {
        uid: null,
        acceptedFriends: [],
      },
    };
  }
};

export default function Page(props: {
  acceptedFriends: friends[];
  uid: string;
}) {
  const { acceptedFriends, uid } = props;
  const [friends, setFriends] = useState(acceptedFriends);
  const [status, setstatus] = useState<friends["status"]>("friend");
  const [firendLoading, setFirendLoading] = useState(false);
  useEffect(() => {
    async function fetchSortedFriends() {
      let myFriendsQuery = query(
        collection(db, `users/${uid}/friends`),
        where("status", "==", status),
        orderBy(status === "pending" ? "createdAt" : "updatedAt", "desc")
      );
      if (status === "block") {
        myFriendsQuery = query(
          collection(db, `users/${uid}/friends`),
          where("status", "==", "block"),
          where("senderId", "==", uid.toString()),
          orderBy("updatedAt", "desc")
        );
      }
      setFirendLoading(true);
      const myFriendsSnap = await getDocs(myFriendsQuery);
      const acceptedFriends = await Promise.all(
        myFriendsSnap.docs.map(async (doc) => {
          const account = await getProfileByUID(doc.id);
          return {
            date:
              status === "pending"
                ? doc.data().createdAt
                : doc.data().updatedAt,
            status: doc.data().status,
            senderId: doc.data().senderId,
            id: doc.id,
            author: {
              ...account,
            },
          };
        })
      );
      setFirendLoading(false);
      setFriends(acceptedFriends);
    }
    fetchSortedFriends();
  }, [status, uid]);

  return (
    <>
      <BackHeader>
        <h2>
          {status === "friend"
            ? "Friends"
            : status === "pending"
            ? "Pending"
            : "Block"}{" "}
          {friends.length > 0 && !firendLoading && friends.length}
        </h2>
      </BackHeader>
      <div
        style={{
          marginTop: "65px",
          minHeight: "calc(100vh - 65px)",
        }}
        className={s.container}
      >
        <nav className={s.nav}>
          <button
            className={`${status === "friend" ? s.active : ""} `}
            onClick={() => {
              setstatus("friend");
            }}
          >
            All
          </button>
          <button
            className={`${status === "block" ? s.active : ""} `}
            onClick={() => {
              setstatus("block");
            }}
          >
            Blocked
          </button>
          <button
            className={`${status === "pending" ? s.active : ""} `}
            onClick={() => {
              setstatus("pending");
            }}
          >
            Pending
          </button>
        </nav>
        {firendLoading ? (
          <Spinner style={{ marginBlock: "1rem", paddingBlock: "1rem" }} />
        ) : friends.length <= 0 ? (
          <p style={{ textAlign: "center", padding: "1rem" }}>
            {status === "block" ? "Empty Blocked" : "Empty Friends"}
          </p>
        ) : (
          <FriendList
            setstatus={setstatus}
            setFriends={setFriends}
            friends={friends}
            uid={uid}
          />
        )}
      </div>
    </>
  );
}

function FriendList({
  setstatus,
  setFriends,
  friends,
  uid,
}: {
  setstatus: Function;
  setFriends: Function;
  friends: friends[];
  uid: string;
}) {
  const router = useRouter();
  const [toggleFriendMenu, settoggleFriendMenu] = useState("");
  const queryClient = useQueryClient();
  const { currentUser } = useContext(PageContext) as PageProps;
  function updateFriendList(id: string) {
    return setFriends(friends.filter((f) => f.id !== id));
  }
  async function handleBlock(friend: friends) {
    try {
      await blockFriend(uid, friend);
      router.replace(router.asPath, undefined, {
        scroll: false,
      });
      updateFriendList(friend.id.toString());
      queryClient.invalidateQueries(["pendingFriends"]);
      queryClient.invalidateQueries(["suggestedFriends"]);
    } catch (error) {
      console.log(error);
    }
  }
  // const statusData: statusDataType = canAccept
  //   ? "canAccept"
  //   : isPending
  //   ? "pending"
  //   : isFriend
  //   ? "friend"
  //   : "notFriend";
  // const [status, setstatus] = useState(statusData);
  return (
    <ul>
      {friends.map((friend) => (
        <li
          key={friend.id}
          aria-label={`Go to ${friend.author?.firstName ?? "Unknow User"} ${
            friend.author?.lastName ?? ""
          }'s Profile page`}
        >
          <Link draggable={false} href={friend.id.toString()} key={friend.id}>
            <div className={s.cardContainer}>
              <div
                style={{
                  width: "50px",
                  position: "relative",
                  height: "50px",
                }}
              >
                <Image
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  fill
                  alt={`${friend.author?.firstName ?? "Unknow User"} ${
                    friend.author?.lastName ?? ""
                  }'s profile picture`}
                  src={
                    friend.author?.photoURL
                      ? (friend.author?.photoURL as string)
                      : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                  }
                  style={{ objectFit: "cover", width: "100%" }}
                />
              </div>
              <div className={s.infoContainer}>
                <div className={s.info}>
                  <p>
                    {`${friend.author?.firstName ?? friend.id} ${
                      friend.author?.lastName
                    }`}
                  </p>
                  <p className={s.date}>
                    {friend.date &&
                      new Timestamp(
                        friend.date?.seconds,
                        friend.date?.nanoseconds
                      )
                        .toDate()
                        .toLocaleDateString()}
                  </p>
                </div>

                <div className={s.actions}>
                  {friend.status === "friend" && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        try {
                          await unFriend(uid, friend);
                          router.replace(router.asPath, undefined, {
                            scroll: false,
                          });
                          queryClient.invalidateQueries(["suggestedFriends"]);
                          updateFriendList(friend.id.toString());
                        } catch (error) {
                          console.log(error);
                        }
                      }}
                    >
                      Unfriend
                    </button>
                  )}
                  {friend.status === "pending" && (
                    <>
                      {friend.senderId === uid ? (
                        <>
                          <button
                            title="Cancel Request"
                            onClick={async (e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const data = {
                                id: friend.id,
                              } as friends;
                              try {
                                await cancelFriendRequest(uid, data);
                                router.replace(router.asPath, undefined, {
                                  scroll: false,
                                });
                                updateFriendList(friend.id.toString());
                                queryClient.refetchQueries(["pendingFriends"]);
                                queryClient.refetchQueries([
                                  "suggestedFriends",
                                ]); // queryClient.invalidateQueries(["pendingFriends"]);
                              } catch (error) {
                                console.log(error);
                              }
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <AcceptFriend
                            onClick={async (e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              await acceptFriends(uid, friend, currentUser);
                              router.replace(router.asPath, undefined, {
                                scroll: false,
                              });
                              updateFriendList(String(friend.id));
                              setstatus("friend");
                              queryClient.refetchQueries(["pendingFriends"]);
                              queryClient.invalidateQueries(["pendingFriends"]);
                            }}
                            className={s.secondary}
                          />
                          <button
                            title="Reject"
                            aria-label="Reject"
                            onClick={async (e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const data = {
                                id: friend.id,
                              } as friends;
                              await rejectFriendRequest(uid, data);
                              router.replace(router.asPath, undefined, {
                                scroll: false,
                              });
                              updateFriendList(friend.id.toString());
                              queryClient.refetchQueries(["pendingFriends"]);
                              queryClient.invalidateQueries(["pendingFriends"]);
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            {/* Reject */}
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {friend.senderId === uid &&
                  friend.status !== "pending" &&
                  friend.status === "block" ? (
                    <button
                      aria-label="Unblock"
                      onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        await unBlockFriend(uid, friend);
                        router.replace(router.asPath, undefined, {
                          scroll: false,
                        });
                        updateFriendList(friend.id.toString());
                      }}
                    >
                      Unblock
                    </button>
                  ) : (
                    <div style={{ position: "relative" }}>
                      <button
                        aria-label="friend action menu" // className={s.danger}
                        onClick={async (e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (toggleFriendMenu === friend.id) {
                            settoggleFriendMenu("");
                          } else {
                            settoggleFriendMenu(friend.id.toString());
                          }
                        }}
                      >
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>
                      <Menu
                        toggleFriendMenu={toggleFriendMenu}
                        friend={friend}
                        handleBlock={async () => handleBlock(friend)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Menu({
  toggleFriendMenu,
  friend,
  handleBlock,
}: {
  toggleFriendMenu: string;
  friend: friends;
  handleBlock: () => Promise<void>;
}) {
  return (
    <AnimatePresence mode="wait">
      {friend.id === toggleFriendMenu && (
        <motion.div
          className={s.menuContainer}
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: friend.id === toggleFriendMenu ? 1 : 0,
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
          <button
            aria-label="Block"
            className={s.danger}
            onClick={async (e) => {
              e.stopPropagation();
              e.preventDefault();
              await handleBlock();
            }}
          >
            <FontAwesomeIcon icon={faBan} />
            Block
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
