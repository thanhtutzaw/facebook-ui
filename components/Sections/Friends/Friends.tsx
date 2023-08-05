import React, { useEffect, useContext, useCallback } from "react";
import s from "./Friends.module.scss";
import { Request } from "./Request";
import { AddSuggestFriend } from "./AddSuggestFriend";
import { Post, Props } from "../../../types/interfaces";
import { AppContext, LIMIT } from "../../../context/AppContext";
import router from "next/router";
import {
  query,
  collection,
  where,
  Timestamp,
  limit,
  orderBy,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { db, getPostWithMoreInfo } from "../../../lib/firebase";
import { PageContext, PageProps } from "../../../context/PageContext";
import { useQuery } from "@tanstack/react-query";
import { useActive } from "../../../hooks/useActiveTab";
import Spinner from "../../Spinner";
import error from "next/error";
interface FriendProps {
  tabIndex: number;
}
export default function Friend(props: FriendProps) {
  const { tabIndex } = props;
  const { active: tab } = useActive();
  const { uid } = useContext(AppContext) as Props;

  const fetchAllUsers = async () => {
    if (!uid) return;
    // let postQuery = query(
    //   collection(db, `/users/${uid}/posts`),
    //   orderBy("createdAt", sortby === "old" ? "asc" : "desc"),
    //   limit(LIMIT + 1)
    // );
    const allUsersQuery = query(
      collection(db, `users`),
      where("__name__", "!=", uid),
      limit(6)
    );
    // if (pageParam) {
    //   const date = new Timestamp(
    //     pageParam.createdAt.seconds,
    //     pageParam.createdAt.nanoseconds
    //   );
    //   postQuery = query(postQuery, startAfter(date));
    // }
    const allFriends = await getDocs(allUsersQuery);
    return allFriends.docs.map((doc) => {
      return {
        id: doc.id,
        author: { ...doc.data().profile },
      };
    });
    // if (!posts) return;
    // const hasMore = posts.length > LIMIT;
    // if (hasMore) {
    //   posts.pop();
    // }
  };
  const { isLoading, error, data } = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => await fetchAllUsers(),
    enabled: tab === "friends",
    // keepPreviousData: true,
    // getNextPageParam: (lastPage) =>
    //   lastPage?.hasMore
    //     ? lastPage.posts![lastPage?.posts?.length! - 1]
    //     : undefined,
  });
  const Requests = [
    { id: 1, author: { firstName: "Aunt May" } },

    { id: 2, author: { firstName: "Peter 2" } },
    { id: 3, author: { firstName: "Peter 3" } },
  ];
  // const Suggestions = ["Captain America", "Iron Man", "Thor"];
  return (
    <div className={s.container}>
      <div className={s.action}>
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
      <div className={s.request}>
        <h2 className={s.header}>
          <p>Friends Requests</p>
          {/* <p className={s.length}>{length}</p> */}
        </h2>
        {Requests.map((f, index) => (
          <Request key={index} f={f} tabIndex={tabIndex} />
        ))}
      </div>
      <div className={s.suggest}>
        <h2 className={s.header}>
          <p>People you may know</p>
        </h2>
        {/* {JSON.stringify(data?.data)} */}
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <p className="error">Unexpected Error Occured !</p>
        ) : (
          <>
            {data?.map((f: any, index: number) => (
              <AddSuggestFriend key={f.id} f={f} tabIndex={tabIndex} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
