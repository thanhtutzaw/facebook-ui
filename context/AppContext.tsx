import {
  Timestamp,
  getDocs,
  startAfter
} from "firebase/firestore";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { NewsFeed_LIMIT } from "../lib/QUERY_LIMIT";
import { DescQuery, getNewsFeed, getPath } from "../lib/firebase";
import { AppProps, Post, RecentPosts } from "../types/interfaces";
// const AppContext = createContext<{ user: User | null }>({ user: null });
export const AppContext = createContext<AppProps | null>(null);
export function AppProvider(props: AppProps) {
  const {
    setprofileSrc,
    profileSrc,
    expired,
    active,
    setlimitedPosts,
    limitedPosts,
    uid,
    posts,
  } = props;
  const [postLoading, setpostLoading] = useState(false);
  const [postEnd, setPostEnd] = useState(false);

  const [selectMode, setselectMode] = useState(false);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const [sortedPost, setsortedPost] = useState<Post[]>([]);
  const updatePost = (id: string, deletedByAuthor?: boolean) => {
    // if (deletedByAuthor) {
    //   setlimitedPosts?.((prev: Post[]) => {
    //     prev.map((p) => {
    //       if (p.id === id) {
    //         return [...prev, { deletedByAuthor: true }];
    //       }
    //     });
    //   });
    // }
    setlimitedPosts?.((prev: Post[]) => prev.filter((post) => post.id !== id));
  };
  useEffect(() => {
    if (posts && !limitedPosts) {
      setlimitedPosts?.(posts);
    }
  }, [limitedPosts, posts, setlimitedPosts]);
  const getMorePosts = useCallback(
    async function () {
      if (!props.hasMore) return;
      console.log("getting more news feed posts .......");
      setpostLoading(true);
      const post = limitedPosts?.[limitedPosts?.length! - 1]!;
      const date = new Timestamp(
        post?.createdAt.seconds,
        post?.createdAt.nanoseconds
      );
      const newsFeedQuery = DescQuery(
        getPath("recentPosts", { uid }),
        NewsFeed_LIMIT + 1,
        startAfter(date)
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
      // setPostEnd(true)
      console.log({ end: finalPost?.length! < NewsFeed_LIMIT });
      setPostEnd(finalPost?.length! < NewsFeed_LIMIT);
      console.log({ postEnd });
    },
    [limitedPosts, postEnd, props.hasMore, setlimitedPosts, uid]
  );

  // const  = async () => {
  //   setpostLoading(true);
  //   const post = limitedPosts?.[limitedPosts?.length - 1]!;
  //   const date = new Timestamp(
  //     post.createdAt.seconds,
  //     post.createdAt.nanoseconds
  //   );
  //   // const postQuery = query(
  //   //   collectionGroup(db, `posts`),
  //   //   where("visibility", "in", ["Friend", "Public"]),
  //   //   startAfter(date),
  //   // );
  //   // const postQuery = query(
  //   //   collectionGroup(db, `posts`),
  //   //   // where("visibility", "in", ["Friend", "Public"]),
  //   //   where("authorId", "in", acceptedFriends ? acceptedFriends : ["0"]),
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
        setprofileSrc,
        profileSrc,
        sortedPost,
        setsortedPost,
        headerContainerRef,
        selectMode,
        setselectMode,
        getMorePosts,
        updatePost,
        posts: limitedPosts,
        postLoading,
        postEnd,

        ...props,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
