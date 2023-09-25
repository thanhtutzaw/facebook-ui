import { useQueries } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import router from "next/router";
import { useContext, useState } from "react";
import s from "./Friends.module.scss";
import { Request } from "./Request";
import { SuggestFriend } from "./SuggestFriend";
import Spinner from "@/components/Spinner";
import { AppContext } from "@/context/AppContext";
import { useActive } from "@/hooks/useActiveTab";
import { db, getProfileByUID } from "@/lib/firebase";
import { AppProps, friends } from "@/types/interfaces";
interface FriendProps {
  tabIndex: number;
}
export default function Friend(props: FriendProps) {
  const { tabIndex } = props;
  const { active: tab } = useActive();
  const { uid, friendReqCount } = useContext(AppContext) as AppProps;

  const fetchSuggestedFriends = async () => {
    if (!uid) return;
    const myFriendsQuery = query(collection(db, `users/${uid}/friends`));
    const myFriends = (await getDocs(myFriendsQuery)).docs.map((doc) => doc.id);
    // console.log("should not be in suggest", myFriends);
    // including friends , pending , blocked (users) string[]
    const suggestedFriendsQuery = query(
      collection(db, `users`),
      where("__name__", "not-in", [uid, ...myFriends])
      // if not friends , pending , blocked or thisAccount , display all users as suggestedAccount
    );
    try {
      const suggestedFriendsSnap = await getDocs(suggestedFriendsQuery);
      return suggestedFriendsSnap.docs.map((doc) => {
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
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch Suggested Friends");
    }
  };
  const fetchPendingFriends = async () => {
    if (!uid) return;
    const pendingfriendsQuery = query(
      collection(db, `users/${uid}/friends`),
      where("status", "==", "pending"),
      where("senderId", "!=", uid), // do not display requset when you send the friend request
      orderBy("senderId", "asc"),
      orderBy("createdAt", "desc")
    );
    try {
      const pendingFriends = await getDocs(pendingfriendsQuery);
      return (await Promise.all(
        pendingFriends.docs.map(async (doc) => {
          if (doc.data()) {
            const profile = await getProfileByUID(doc.id.toString());
            return {
              id: doc.id,
              ...doc.data(),
              author: {
                ...profile,
                photoURL: profile.photoURL
                  ? profile.photoURL
                  : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
              },
            } as friends;
          } else {
            return [];
          }
        })
      )) as friends[];
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch users");
    }
  };

  const [suggestedFriends, pendingFriends] = useQueries({
    queries: [
      {
        queryKey: ["suggestedFriends", uid, friendReqCount],
        queryFn: async () => await fetchSuggestedFriends(),
        enabled: tab === "friends",
      },
      {
        queryKey: ["pendingFriends", uid, friendReqCount],
        queryFn: async () => await fetchPendingFriends(),
        enabled: tab === "friends",
      },
    ],
  });
  const suggested = suggestedFriends.data ?? [];
  const pending = pendingFriends.data ?? [];

  const Requests = [
    { id: 1, author: { firstName: "Aunt May" } },
    { id: 2, author: { firstName: "Peter 2" } },
    { id: 3, author: { firstName: "Peter 3" } },
  ];
  // const [requestCount, setrequestCount] = useState(pending.length);
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
          All Friends
        </button>
      </div>
      {pending.length > 0 && (
        <div className={s.request}>
          <h2 className={s.header}>
            <p>
              Friends Requests{" "}
              <span style={{ color: "red" }}>{pending.length}</span>
            </p>
          </h2>
          {pending.map((f) => (
            <Request
              // setrequestCount={setrequestCount}
              key={f.id.toString()}
              f={f}
              tabIndex={tabIndex}
            />
          ))}
        </div>
      )}
      <div className={s.suggest}>
        <h2 className={s.header}>
          <p>People you may know</p>
        </h2>
        {suggestedFriends.isLoading ? (
          <Spinner />
        ) : suggestedFriends.error ? (
          <p className="error">Unexpected Error Occured !</p>
        ) : (
          <>
            {suggested?.map((f: any) => (
              <SuggestFriend key={f.id} f={f} tabIndex={tabIndex} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
