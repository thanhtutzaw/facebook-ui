import { AcceptFriend } from "@/components/Button/AcceptFriend";
import BackHeader from "@/components/Header/BackHeader";
import Spinner from "@/components/Spinner";
import { PageContext, PageProps } from "@/context/PageContext";
import useQueryFn from "@/hooks/useQueryFn";
import { collectionBasePath, getPath, getProfileByUID } from "@/lib/firebase";
import { verifyIdToken } from "@/lib/firebaseAdmin";
import { checkPhotoURL } from "@/lib/firestore/profile";
import { friends } from "@/types/interfaces";
import { faBan, faEllipsisV, faInfoCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { Timestamp, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import nookies from "nookies";
import confirm from "public/assets/confirm-beep.mp3";
import { useContext, useEffect, useState } from "react";
import useSound from "use-sound";
import {
  acceptFriends,
  blockFriend,
  cancelFriendRequest,
  rejectFriendRequest,
  unBlockFriend,
  unFriend,
} from "@/lib/firestore/friends";
import s from "./index.module.scss";
type TqueryFn = ReturnType<typeof useQueryFn>["queryFn"];
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;

    const { uid } = token;
    const myFriendsQuery = query(getPath("friends", { uid }),limit(1));
    const myFriends = (await getDocs(myFriendsQuery)).docs.map((doc) => doc.id);
    const suggestedFriendsQuery = query(
      collectionBasePath,
      where("__name__", "not-in", [uid, ...myFriends])
      // if not friends , pending , blocked or thisAccount , display all users as suggestedAccount
    );
    let acceptedFriends = [];
    const suggestedFriendsSnap = await getDocs(suggestedFriendsQuery);
    acceptedFriends = suggestedFriendsSnap.docs.map((doc) => {
      if (doc.data()) {
        return {
          id: doc.id,
          author: {
            ...doc.data().profile,
          },
        };
      } else {
        return [];
      }
    });
    // catch (error) {
    //   console.log(error);
    //   throw new Error("Failed to fetch Suggested Friends");
    // }
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
  const { queryFn } = useQueryFn();
  // useEffect(() => {
  //   async function fetchSortedFriends() {
  //     let myFriendsQuery = query(
  //       getPath("friends", { uid }),
  //       where("status", "==", status),
  //       orderBy(status === "pending" ? "createdAt" : "updatedAt", "desc")
  //     );

  //     setFirendLoading(true);
  //     const myFriendsSnap = await getDocs(myFriendsQuery);
  //     const acceptedFriends = await Promise.all(
  //       myFriendsSnap.docs.map(async (doc) => {
  //         const account = await getProfileByUID(doc.id);
  //         return {
  //           date:
  //             status === "pending"
  //               ? doc.data().createdAt
  //               : doc.data().updatedAt,
  //           status: doc.data().status,
  //           senderId: doc.data().senderId,
  //           id: doc.id,
  //           author: {
  //             ...account,
  //           },
  //         };
  //       })
  //     );
  //     setFirendLoading(false);
  //     setFriends(acceptedFriends);
  //   }
  //   fetchSortedFriends();
  // }, [status, uid]);

  return (
    <>
      <BackHeader>
        <h2>
          Suggestions {friends.length > 0 && !firendLoading && friends.length}
        </h2>
      </BackHeader>
      <div
        className={`mt-[65px]
          min-h-[calc(100vh - 65px)] ${s.container}`}
      >
        {firendLoading ? (
          <Spinner style={{ marginBlock: "1rem", paddingBlock: "1rem" }} />
        ) : friends.length <= 0 ? (
          <p className="p-4 text-center">{"Empty Suggestions"}</p>
        ) : (
          <>
            
            <FriendList friends={friends} />
          </>
        )}
      </div>
    </>
  );
}

function FriendList({ friends }: { friends: friends[] }) {
  const { currentUser } = useContext(PageContext) as PageProps;

  return (
    <ul>
      <p className={`text-dimgray text-[15px] p-[.5rem_1rem_0] m-0 `}>
        <FontAwesomeIcon icon={faInfoCircle} /> All users from facebook-ui-zee
      </p>
      {friends.map((friend) => (
        <li
          key={friend.id}
          aria-label={`Go to ${friend.author?.firstName ?? "Unknow User"} ${
            friend.author?.lastName ?? ""
          }'s Profile page`}
        >
          <Link draggable={false} href={friend.id.toString()} key={friend.id}>
            <div className={s.cardContainer}>
              <div className="w-[50px] h-[50px] relative">
                <Image
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  fill
                  alt={`${friend.author?.firstName ?? "Unknow User"} ${
                    friend.author?.lastName ?? ""
                  }'s profile picture`}
                  loading="lazy"
                  src={checkPhotoURL(friend.author?.photoURL)}
                  className="object-cover w-full"
                />
              </div>
              <div className={s.infoContainer}>
                <div className={s.info}>
                  <p>
                    {friend.author?.firstName || friend.author?.lastName
                      ? `${friend.author?.firstName} ${friend.author?.lastName}`
                      : friend.id}
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
