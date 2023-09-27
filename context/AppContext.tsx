import {
  Timestamp,
  collectionGroup,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { createContext, useEffect, useRef, useState } from "react";
import { NewsFeed_LIMIT } from "../lib/QUERY_LIMIT";
import { db, getPostWithMoreInfo } from "../lib/firebase";
import { Post, AppProps } from "../types/interfaces";
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
  } = props;
  const [postLoading, setpostLoading] = useState(false);
  const [postEnd, setPostEnd] = useState(false);

  const [selectMode, setselectMode] = useState(false);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const [sortedPost, setsortedPost] = useState<Post[]>([]);
  const updatePost = (id: string) => {
    console.log(id);
    setlimitedPosts?.((prev: Post[]) => prev.filter((post) => post.id !== id));
    console.log(limitedPosts);
  };
  useEffect(() => {
    if (posts && !limitedPosts) {
      setlimitedPosts?.(posts);
    }
    console.log(posts);
    console.log(limitedPosts);
  }, [limitedPosts, posts, setlimitedPosts]);
  const getMorePosts = async () => {
    setpostLoading(true);
    const post = posts?.[posts?.length - 1]!;
    const date = new Timestamp(
      post.createdAt.seconds,
      post.createdAt.nanoseconds
    );
    // const postQuery = query(
    //   collectionGroup(db, `posts`),
    //   where("visibility", "in", ["Friend", "Public"]),
    //   orderBy("createdAt", "desc"),
    //   startAfter(date),
    // );
    const postQuery = query(
      collectionGroup(db, `posts`),
      // where("visibility", "in", ["Friend", "Public"]),
      where("authorId", "in", acceptedFriends ? acceptedFriends : ["0"]),
      orderBy("createdAt", "desc"),
      startAfter(date),
      limit(NewsFeed_LIMIT)
    );
    const finalPost = (await getPostWithMoreInfo(uid!, postQuery)) ?? [];

    setlimitedPosts?.(limitedPosts?.concat(finalPost));
    setpostLoading(false);
    if (finalPost.length < NewsFeed_LIMIT) {
      setPostEnd(true);
    }
  };
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
        postEnd,

        ...props,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
