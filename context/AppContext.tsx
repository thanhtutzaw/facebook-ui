import { Timestamp, getDocs, startAfter } from "firebase/firestore";
import {
  createContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
  const deletePost = useCallback(
    (id: string) => {
      setlimitedPosts?.((prev: Post[]) =>
        prev.filter((post) => post.id !== id)
      );
    },
    [setlimitedPosts]
  );
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
        deletePost,
        posts: limitedPosts,
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
