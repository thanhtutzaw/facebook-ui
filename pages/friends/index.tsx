import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
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
  rejectFriendRequest,
  unBlockFriend,
  unFriend,
} from "../../lib/firestore/friends";
import { friends } from "../../types/interfaces";
import s from "./index.module.scss";
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
  const router = useRouter();
  const { currentUser } = useContext(PageContext) as PageProps;
  const queryClient = useQueryClient();
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
          where("senderId", "==", uid),
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
    <div className="user">
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
          height: "calc(100vh - 65px)",
        }}
        className={s.container}
      >
        <nav>
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
          <Spinner />
        ) : friends.length <= 0 ? (
          <p style={{ textAlign: "center", padding: "1rem" }}>
            {status === "block" ? "Empty Blocked" : "Empty Friends"}
          </p>
        ) : (
          <ul>
            {friends.map((friend) => (
              <li
                key={friend.id}
                aria-label={`Go to ${
                  friend.author?.firstName ?? "Unknow User"
                } ${friend.author?.lastName ?? ""}'s Profile page`}
              >
                <Link href={friend.id.toString()} key={friend.id}>
                  <div className={s.cardContainer}>
                    <Image
                      className={s.profile}
                      alt={"name"}
                      width={50}
                      height={50}
                      src={
                        friend.author?.photoURL
                          ? (friend.author?.photoURL as string)
                          : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                      }
                    />
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
                            onClick={async () => {
                              try {
                                await unFriend(uid, friend);
                                router.replace(router.asPath, undefined, {
                                  scroll: false,
                                });
                                queryClient.invalidateQueries([
                                  "suggestedFriends",
                                ]);
                              } catch (error) {
                                console.log(error);
                              }
                            }}
                          >
                            Un Friend
                          </button>
                        )}
                        {friend.status === "pending" && (
                          <>
                            {friend.senderId === uid ? (
                              <>
                                {/* <button
                        onClick={async () => {
                          try {
                            await unFriend(uid, friend);
                            router.replace(router.asPath, undefined, {
                              scroll: false,
                            });
                            setFriends(
                              friends.filter((f) => f.id !== friend.id)
                            );
                            queryClient.invalidateQueries(["suggestedFriends"]);
                          } catch (error) {
                            console.log(error);
                          }
                        }}
                      >
                        Delete
                      </button> */}
                                <button
                                  title="Cancel Request"
                                  onClick={async () => {
                                    const data = {
                                      id: friend.id,
                                    } as friends;
                                    await rejectFriendRequest(uid, data);
                                    router.replace(router.asPath, undefined, {
                                      scroll: false,
                                    });
                                    queryClient.refetchQueries([
                                      "pendingFriends",
                                    ]);
                                    queryClient.refetchQueries([
                                      "suggestedFriends",
                                    ]);
                                    // queryClient.invalidateQueries(["pendingFriends"]);
                                  }}
                                  className={`${s.editToggle} ${s.secondary}`}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  aria-label="Accept"
                                  onClick={async () => {
                                    const data = {
                                      id: friend.id,
                                    } as friends;
                                    await acceptFriends(uid, data, currentUser);
                                    router.replace("/", undefined, {
                                      scroll: false,
                                    });
                                    queryClient.refetchQueries([
                                      "pendingFriends",
                                    ]);
                                    queryClient.invalidateQueries([
                                      "pendingFriends",
                                    ]);
                                  }}
                                  className={`${s.editToggle} ${s.secondary}`}
                                >
                                  Accept
                                </button>
                                <button
                                  aria-label="Reject"
                                  onClick={async () => {
                                    const data = {
                                      id: friend.id,
                                    } as friends;
                                    await rejectFriendRequest(uid, data);
                                    router.replace("/", undefined, {
                                      scroll: false,
                                    });
                                    queryClient.refetchQueries([
                                      "pendingFriends",
                                    ]);
                                    queryClient.invalidateQueries([
                                      "pendingFriends",
                                    ]);
                                  }}
                                  className={`${s.editToggle} ${s.secondary}`}
                                >
                                  Reject
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
                            onClick={async () => {
                              await unBlockFriend(uid, friend);
                              router.replace(router.asPath, undefined, {
                                scroll: false,
                              });
                            }}
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            aria-label="friend action menu"
                            // className={s.danger}
                            onClick={async (e) => {
                              e.stopPropagation();
                              e.preventDefault();

                              console.log("run");
                              // try {
                              //   await blockFriend(uid, friend);
                              //   router.replace(router.asPath, undefined, {
                              //     scroll: false,
                              //   });
                              //   queryClient.invalidateQueries([
                              //     "suggestedFriends",
                              //   ]);
                              // } catch (error) {
                              //   console.log(error);
                              // }
                            }}
                          >
                            <FontAwesomeIcon icon={faEllipsisV} />
                            {/* <FontAwesomeIcon icon={faBan} /> */}
                            {/* Block */}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {/* {friends.length > 0 ? (
          
        ) : (
          <p style={{ textAlign: "center", padding: "1rem" }}>
            {status === "block" ? "Empty Blocked" : "Empty Friends"}
          </p>
        )} */}
      </div>
    </div>
  );
}
