import { useQuery, useQueries } from "@tanstack/react-query";
import {
  collection,
  collectionGroup,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import router from "next/router";
import { useContext } from "react";
import { AppContext } from "../../../context/AppContext";
import { useActive } from "../../../hooks/useActiveTab";
import { db, getProfileByUID } from "../../../lib/firebase";
import { Props, friends } from "../../../types/interfaces";
import Spinner from "../../Spinner";
import { AddSuggestFriend } from "./AddSuggestFriend";
import s from "./Friends.module.scss";
import { Request } from "./Request";
interface FriendProps {
  tabIndex: number;
}
export default function Friend(props: FriendProps) {
  const { tabIndex } = props;
  const { active: tab } = useActive();
  const { uid } = useContext(AppContext) as Props;

  const fetchAllUsers = async () => {
    if (!uid) return;
    const allUsersQuery = query(
      collection(db, `users`),
      where("__name__", "!=", uid)
    );
    // const pendingfriendsQuery = query(
    //   collection(db, `users/friends`),
    //   where("status", "==", "pending"),
    //   orderBy("createdAt", "desc")
    // );
    try {
      // const pendingFriends = await getDocs(pendingfriendsQuery);
      const allFriendsSnap = await getDocs(allUsersQuery);
      return allFriendsSnap.docs.map((doc) => {
        if (doc.data()) {
          return {
            id: doc.id,
            author: { ...doc.data().profile },
          };
        } else {
          return [];
        }
      });
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch users");
    }
  };
  const fetchPendingFriends = async () => {
    if (!uid) return;
    const pendingfriendsQuery = query(
      collection(db, `users/${uid}/friends`),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    try {
      const pendingFriends = await getDocs(pendingfriendsQuery);
      console.log(pendingFriends.empty);
      return pendingFriends.docs.map((doc) => {
        if (doc.data()) {
          const profile = getProfileByUID(doc.id.toString());
          return {
            id: doc.id,
            ...doc.data(),
            author: { ...profile },
          } ;
        } else {
          return [];
        }
      });
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch users");
    }
  };
  // const { isLoading, error, data } = useQuery({
  //   queryKey: ["allUsers"],
  //   queryFn: async () => await fetchAllUsers(),
  //   enabled: tab === "friends",
  //   // placeholderData: [],
  // });
  const [allFriends, pendingFriends] = useQueries({
    queries: [
      {
        queryKey: ["allUsers"],
        queryFn: async () => await fetchAllUsers(),
        enabled: tab === "friends",
      },
      {
        queryKey: ["pendingFriends"],
        queryFn: async () => await fetchPendingFriends(),
        enabled: tab === "friends",
      },
    ],
  });
  const friends = allFriends.data ?? [];
  const pending = pendingFriends.data ?? [];

  const Requests = [
    { id: 1, author: { firstName: "Aunt May" } },
    { id: 2, author: { firstName: "Peter 2" } },
    { id: 3, author: { firstName: "Peter 3" } },
  ];
  // const Suggestions = ["Captain America", "Iron Man", "Thor"];
  return (
    <div className={s.container}>
      <div
        style={{ paddingBottom: "10px", paddingInline: "1rem" }}
        className={s.action}
      >
        <button tabIndex={tabIndex}>Suggestions</button>
        <button
          aria-label="Go to my friends page"
          title="Go to my friends page"
          tabIndex={tabIndex}
          className={s.item}
          onClick={() => {
            router.push("/friends");
          }}
        >
          My Friends
        </button>
      </div>
      {pending.length > 0 && (
        <div className={s.request}>
          <h2 className={s.header}>
            <p>Friends Requests</p>
          </h2>
          {pending.map((f, index) => (
            <Request key={index} f={f} tabIndex={tabIndex} />
          ))}
        </div>
      )}
      <div className={s.suggest}>
        <h2 className={s.header}>
          <p>People you may know</p>
        </h2>
        {allFriends.isLoading ? (
          <Spinner />
        ) : allFriends.error ? (
          <p className="error">Unexpected Error Occured !</p>
        ) : (
          <>
            {friends?.map((f: any) => (
              <AddSuggestFriend key={f.id} f={f} tabIndex={tabIndex} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
