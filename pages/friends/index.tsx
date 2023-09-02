import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { GetServerSideProps } from "next";
import BackHeader from "../../components/Header/BackHeader";
import { db, getProfileByUID, userToJSON } from "../../lib/firebase";
import { getUserData, verifyIdToken } from "../../lib/firebaseAdmin";
import s from "./index.module.scss";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import Image from "next/image";
import Link from "next/link";
import nookies from "nookies";
import {
  acceptFriends,
  blockFriends,
  unFriend,
} from "../../lib/firestore/friends";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { account, friends } from "../../types/interfaces";
import { User } from "firebase/auth";
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
        // const account = (await getUserData(doc.id as string))! as UserRecord;
        // const accountJSON = userToJSON(account) as UserRecord;
        // return {
        //   ...doc.data(),
        //   id: doc.id,
        //   author: {
        //     ...accountJSON,
        //   },
        // };

        const account = await getProfileByUID(doc.id);
        // const accountJSON = userToJSON(account) as UserRecord;
        return {
          status: doc.data().status,
          senderId: doc.data().senderId,
          // ...doc.data(),
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
  const allFriendsCount = acceptedFriends.length;
  const router = useRouter();
  // const displayName = friend
  const queryClient = useQueryClient();
  const [friends, setFriends] = useState(acceptedFriends);
  const [status, setstatus] = useState<friends["status"]>("friend");
  //  === "friend"
  //         ? "friend"
  //         : status === "pending"
  //         ? "pending"
  //         : "block"
  useEffect(() => {
    async function fetchSortedFriends() {
      const myFriendsQuery = query(
        collection(db, `users/${uid}/friends`),
        where("status", "==", status),
        orderBy(status === "pending" ? "createdAt" : "updatedAt", "desc")
      );
      // if (status === "friend") return;
      const myFriendsSnap = await getDocs(myFriendsQuery);
      const acceptedFriends = await Promise.all(
        myFriendsSnap.docs.map(async (doc) => {
          // const account = (await getUserData(doc.id as string))! as UserRecord;
          const account = await getProfileByUID(doc.id);
          // const accountJSON = userToJSON(account) as UserRecord;
          return {
            status: doc.data().status,
            senderId: doc.data().senderId,
            // ...doc.data(),
            id: doc.id,
            author: {
              ...account,
            },
          };
        })
      );
      setFriends(acceptedFriends);
    }
    fetchSortedFriends();
  }, [status, uid]);

  return (
    <div className="user">
      <BackHeader>
        <h2>Friends {allFriendsCount > 0 && allFriendsCount}</h2>
      </BackHeader>
      <div
        style={{
          marginTop: "65px",
          height: "calc(100vh - 65px)",
          // backgroundColor: "#dadada",
        }}
        className={s.container}
      >
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
        {allFriendsCount > 0 ? (
          <ul>
            {friends.map((friend) => (
              <li key={friend.id} aria-label="Go to Friends Profile">
                <Link href={friend.id.toString()} key={friend.id}>
                  <Image
                    className={s.profile}
                    alt={"name"}
                    width={100}
                    height={100}
                    src={
                      (friend.author?.photoURL as string) ??
                      "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                    }
                  />
                  <p>
                    {/* {friend.author} */}
                    {`${friend.author?.firstName ?? friend.id} ${
                      friend.author?.lastName
                    }`}
                  </p>
                </Link>
                {friend.status === "friend" && (
                  <button
                    onClick={async () => {
                      try {
                        await unFriend(uid, friend);
                        router.replace(router.asPath, undefined, {
                          scroll: false,
                        });
                        queryClient.refetchQueries(["allUsers"]);
                        queryClient.invalidateQueries(["allUsers"]);
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
                      <button
                        onClick={async () => {
                          try {
                            await unFriend(uid, friend);
                            router.replace(router.asPath, undefined, {
                              scroll: false,
                            });
                            setFriends(
                              friends.filter((f) => f.id !== friend.id)
                            );
                            queryClient.refetchQueries(["allUsers"]);
                            queryClient.invalidateQueries(["allUsers"]);
                          } catch (error) {
                            console.log(error);
                          }
                        }}
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          const data = {
                            id: friend.id,
                          } as friends;
                          await acceptFriends(uid, data);
                          router.replace("/", undefined, { scroll: false });
                          queryClient.refetchQueries(["pendingFriends"]);
                          queryClient.invalidateQueries(["pendingFriends"]);
                        }}
                        className={`${s.editToggle} ${s.secondary}`}
                      >
                        Accept
                      </button>
                    )}
                  </>
                )}

                {friend.senderId === uid && friend.status !== "pending" ? (
                  <button
                    onClick={async () => {
                      await unFriend(uid, friend);
                      // try {
                      //   await blockFriends(uid, friend);
                      //   router.replace(router.asPath, undefined, {
                      //     scroll: false,
                      //   });
                      //   queryClient.refetchQueries(["allUsers"]);
                      //   queryClient.invalidateQueries(["allUsers"]);
                      // } catch (error) {
                      //   console.log(error);
                      // }
                    }}
                  >
                    Un Block
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      try {
                        await blockFriends(uid, friend);
                        router.replace(router.asPath, undefined, {
                          scroll: false,
                        });
                        queryClient.refetchQueries(["allUsers"]);
                        queryClient.invalidateQueries(["allUsers"]);
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                  >
                    Block
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: "center", padding: "1rem" }}>Empty Friends</p>
        )}
        {JSON.stringify(friends)}
        {/* {JSON.stringify(savedPosts)} */}
      </div>
    </div>
  );
}
