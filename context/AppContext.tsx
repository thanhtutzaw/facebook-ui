import { Timestamp, getDocs, startAfter } from "firebase/firestore";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { NewsFeed_LIMIT } from "../lib/QUERY_LIMIT";
import { DescQuery, getNewsFeed, getPath } from "../lib/firebase";
import { AppProps, Post, RecentPosts } from "../types/interfaces";
export const AppContext = createContext<AppProps | null>(null);
export function AppProvider(props: AppProps) {
  const {
    token,
    setprofileSrc,
    profileSrc,
    expired,
    active,
    setnewsFeedPost,
    newsFeedPost,
    uid,
    posts,
  } = props;
  const [postLoading, setpostLoading] = useState(false);
  const [postEnd, setPostEnd] = useState(false);
  // const { active } = useActiveTab();
  const [selectMode, setselectMode] = useState(false);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const [sortedPost, setsortedPost] = useState<Post[]>([]);
  const deletePost = useCallback(
    (id: string) => {
      setnewsFeedPost?.((prev: Post[]) =>
        prev.filter((post) => post.id !== id)
      );
    },
    [setnewsFeedPost]
  );
  useEffect(() => {
    if (posts && !newsFeedPost) {
      setnewsFeedPost?.(posts);
    }
  }, [newsFeedPost, posts, setnewsFeedPost]);
  const getMorePosts = useCallback(
    async function () {
      if (!props.hasMore) return;
      setpostLoading(true);
      const post = newsFeedPost?.[newsFeedPost?.length! - 1]!;
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
      setnewsFeedPost?.(newsFeedPost?.concat(finalPost!));
      setpostLoading(false);
      // console.log({ end: finalPost?.length! < NewsFeed_LIMIT });
      setPostEnd(finalPost?.length! < NewsFeed_LIMIT);
      // console.log({ postEnd });
    },
    [newsFeedPost, props.hasMore, setnewsFeedPost, uid]
  );
  return (
    <AppContext.Provider
      value={{
        active,
        setprofileSrc,
        profileSrc,
        sortedPost,
        setsortedPost,
        headerContainerRef,
        selectMode,
        setselectMode,
        getMorePosts,
        deletePost,
        posts: newsFeedPost,
        postLoading,
        postEnd,
        token,
        ...props,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
