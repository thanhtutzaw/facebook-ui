import {
  Timestamp,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { NewsFeed_LIMIT } from "../lib/QUERY_LIMIT";
import { getNewsFeed, getPath } from "../lib/firebase";
import { AppProps, Post, RecentPosts } from "../types/interfaces";
// const AppContext = createContext<{ user: User | null }>({ user: null });
export const AppContext = createContext<AppProps | null>(null);
export function AppProvider(props: AppProps) {
  const {
    expired,
    acceptedFriends,
    active,
    setlimitedPosts,
    limitedPosts,
    uid,
    posts,
    hasMore,
  } = props;
  const [postLoading, setpostLoading] = useState(false);
  const [postEnd, setPostEnd] = useState(false);

  const [selectMode, setselectMode] = useState(false);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const [sortedPost, setsortedPost] = useState<Post[]>([]);
  const updatePost = (id: string) => {
    setlimitedPosts?.((prev: Post[]) => prev.filter((post) => post.id !== id));
  };
  useEffect(() => {
    if (posts && !limitedPosts) {
      setlimitedPosts?.(posts);
    }
  }, [limitedPosts, posts, setlimitedPosts]);
  const getMorePosts = useCallback(
    async function () {
      console.log("getting more news feed posts .......");
      setpostLoading(true);
      const post = limitedPosts?.[limitedPosts?.length! - 1]!;
      const date = new Timestamp(
        post?.createdAt.seconds,
        post?.createdAt.nanoseconds
      );
      const newsFeedQuery = query(
        getPath("recentPosts", { uid }),
        orderBy("createdAt", "desc"),
        startAfter(date),
        limit(NewsFeed_LIMIT + 1)
      );
      let recentPosts: RecentPosts[] = [];
      try {
        recentPosts = (await getDocs(newsFeedQuery)).docs.map((doc) => {
          return {
            ...(doc.data() as RecentPosts),
          };
        });
        recentPosts.shift();
      } catch (error) {
        console.log("Recent Post Error - ", error);
      }
      const finalPost = await getNewsFeed(String(uid), recentPosts);
      setlimitedPosts?.(limitedPosts?.concat(finalPost!));
      setpostLoading(false);
      console.log({ end: finalPost?.length! < NewsFeed_LIMIT });
      setPostEnd(finalPost?.length! < NewsFeed_LIMIT);
      console.log({ postEnd });
      // setPostEnd(finalPost?.length! < NewsFeed_LIMIT);

      // setPostEnd(finalPost?.length! <= NewsFeed_LIMIT);
      // if (limitedPosts?.length! > NewsFeed_LIMIT) {
      // }
      // if (
      //   finalPost?.length! < NewsFeed_LIMIT ||
      //   limitedPosts?.length! < NewsFeed_LIMIT
      // ) {
      //   // setPostEnd(true);
      //   // finalPost?.pop();
      // }
    },
    [limitedPosts, postEnd, setlimitedPosts, uid]
  );
  useEffect(() => {
    console.log({ postEnd });
  }, [postEnd]);

  // const  = async () => {
  //   setpostLoading(true);
  //   console.log(limitedPosts?.length);
  //   const post = limitedPosts?.[limitedPosts?.length - 1]!;
  //   console.log(post);
  //   const date = new Timestamp(
  //     post.createdAt.seconds,
  //     post.createdAt.nanoseconds
  //   );
  //   console.log(post.createdAt);
  //   // const postQuery = query(
  //   //   collectionGroup(db, `posts`),
  //   //   where("visibility", "in", ["Friend", "Public"]),
  //   //   orderBy("createdAt", "desc"),
  //   //   startAfter(date),
  //   // );
  //   // const postQuery = query(
  //   //   collectionGroup(db, `posts`),
  //   //   // where("visibility", "in", ["Friend", "Public"]),
  //   //   where("authorId", "in", acceptedFriends ? acceptedFriends : ["0"]),
  //   //   orderBy("createdAt", "desc"),
  //   //   startAfter(date),
  //   //   limit(NewsFeed_LIMIT)
  //   // );

  //   // const finalPost = (await getPostWithMoreInfo(uid!, newsFeedQuery)) ?? [];

  // };
  useEffect(() => {
    const tabs = document.getElementById("tabs");
    const main = document.getElementsByTagName("main")[0];

    const headerContainer = headerContainerRef?.current;
    if (window.location.hash === "" || window.location.hash === "#home") {
      if (!headerContainer) return;
      headerContainer.style.transform = "translateY(0px)";
      headerContainer.style.height = "120px";
      // main.scrollTo({
      //   top: 0,
      //   behavior: "smooth",
      // });
      tabs?.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    }
    window.onhashchange = (e) => {
      if (window.location.hash === "" || window.location.hash === "#home") {
        tabs?.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        main.style.scrollSnapType = "none";
        if (!headerContainer) return;
        headerContainer.style.transform = "translateY(-60px)";
        headerContainer.style.height = "60px";
      }
    };
  }, [active, expired]);
  return (
    <AppContext.Provider
      value={{
        sortedPost,
        setsortedPost,
        headerContainerRef,
        selectMode,
        setselectMode,
        getMorePosts,
        updatePost,
        posts: limitedPosts,
        postLoading,
        // postEnd,

        ...props,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
