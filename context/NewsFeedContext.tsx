import { Timestamp, getDocs, startAfter } from "firebase/firestore";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { NewsFeed_LIMIT } from "../lib/QUERY_LIMIT";
import { DescQuery, getNewsFeed, getPath } from "../lib/firebase";
import { Post, RecentPosts } from "../types/interfaces";
export interface Props {
  expired: boolean;
  hasMore: boolean;
  uid: string;
  posts: Post[];
  children: ReactNode;
}
interface NewsFeedType {
  newsFeedPost: Post[];
  deletePost: (id: string) => void;
  getMorePosts: () => Promise<void>;
  postLoading: boolean;
  postEnd: boolean;
}
export const NewsFeedContext = createContext<(NewsFeedType & Props) | null>(
  null
);
export function NewsFeedProvider(props: Props) {
  const { hasMore, uid, posts, expired } = props;
  const [postLoading, setpostLoading] = useState(false);
  const [postEnd, setPostEnd] = useState(false);
  const [newsFeedPost, setnewsFeedPost] = useState(posts ?? []);
  useEffect(() => {
    if (!expired) setnewsFeedPost(posts!);
  }, [expired, posts]);
  useEffect(() => {
    if (posts && !newsFeedPost) {
      setnewsFeedPost(posts);
    }
  }, [newsFeedPost, posts]);
  const getMoreNewsFeed = useCallback(async () => {
    if (!hasMore) return;
    setpostLoading(true);
    const post = newsFeedPost[newsFeedPost.length - 1];
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
    setnewsFeedPost(newsFeedPost.concat(finalPost!));
    setpostLoading(false);
    // console.log({ end: finalPost?.length! < NewsFeed_LIMIT });
    setPostEnd(finalPost?.length! < NewsFeed_LIMIT);
    // console.log({ postEnd });
  }, [newsFeedPost, hasMore, setnewsFeedPost, uid]);
  const deletePost = useCallback(
    (id: string) => {
      setnewsFeedPost((prev: Post[]) => prev.filter((post) => post.id !== id));
    },
    [setnewsFeedPost]
  );
  return (
    <NewsFeedContext.Provider
      value={{
        // setUnReadNotiCount,
        // UnReadNotiCount,
        // headerContainerRef,
        newsFeedPost,
        // setnewsFeedPost,
        getMorePosts:getMoreNewsFeed,
        deletePost,
        postLoading,
        postEnd,
        ...props,
        // hasMore,
        // posts: newsFeedPost,
      }}
    >
      {props.children}
    </NewsFeedContext.Provider>
  );
}
export const useNewsFeedContext = () => {
  const context = useContext(NewsFeedContext);
  if (!context) throw new Error("AppContext should use within AppProvider");

  return context;
};
