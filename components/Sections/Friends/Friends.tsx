import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import router from "next/router";
import { useContext } from "react";
import { AppContext } from "../../../context/AppContext";
import { useActive } from "../../../hooks/useActiveTab";
import { db } from "../../../lib/firebase";
import { Props } from "../../../types/interfaces";
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
    // let postQuery = query(
    //   collection(db, `/users/${uid}/posts`),
    //   orderBy("createdAt", sortby === "old" ? "asc" : "desc"),
    //   limit(LIMIT + 1)
    // );
    const allUsersQuery = query(
      collection(db, `users`),
      where("__name__", "!=", uid)
      // limit(6)
    );
    // if (pageParam) {
    //   const date = new Timestamp(
    //     pageParam.createdAt.seconds,
    //     pageParam.createdAt.nanoseconds
    //   );
    //   postQuery = query(postQuery, startAfter(date));
    // }
    const allFriendsSnap = await getDocs(allUsersQuery);
    return allFriendsSnap.docs.map((doc) => {
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
      <div style={{ paddingBottom: "10px" }} className={s.action}>
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
            {data?.map((f: any) => (
              <AddSuggestFriend key={f.id} f={f} tabIndex={tabIndex} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
