import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { Timestamp, getDocs, startAfter } from "firebase/firestore";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { NewsFeed_LIMIT } from "../lib/QUERY_LIMIT";
import { DescQuery, getNewsFeed, getPath } from "../lib/firebase";
import { AppProps, Post, RecentPosts, Tabs } from "../types/interfaces";
export interface Props {
  setprofileSrc: Function;
  profileSrc: string;
  hasMore: boolean;
  token: DecodedIdToken | null | undefined;
  setnewsFeedPost: Function;
  newsFeedPost: Post[];
  uid: string;
  active: Tabs;
  posts: Post[];
  children: ReactNode;
}
export const AppContext = createContext<AppProps | null>(null);
export function AppProvider(props: Props) {
  const { hasMore, setnewsFeedPost, newsFeedPost, uid, posts  } = props;
  const [postLoading, setpostLoading] = useState(false);
  const [postEnd, setPostEnd] = useState(false);
  // const { active } = useActiveTab();
    const [UnReadNotiCount, setUnReadNotiCount] = useState(0);
  const [selectMode, setselectMode] = useState(false);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const [sortedPost, setsortedPost] = useState<Post[]>([]);
  const deletePost = useCallback(
    (id: string) => {
      setnewsFeedPost((prev: Post[]) =>
        prev.filter((post) => post.id !== id)
      );
    },
    [setnewsFeedPost]
  );
  useEffect(() => {
    if (posts && !newsFeedPost) {
      setnewsFeedPost(posts);
    }
  }, [newsFeedPost, posts, setnewsFeedPost]);
  const getMorePosts = useCallback(
    async function () {
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
    },
    [newsFeedPost, hasMore, setnewsFeedPost, uid]
  );

  // useEffect(() => {
  // window.onhashchange = () => {
  // setActiveNav(active!);
  // setActiveNav(window.location.hash.replace('#','') as Tabs)
  // }
  // if (active !== window.location.hash.replace("#", "")) {
  // if (window.location.pathname !== "/") return;
  // setActiveNav(window.location.hash.replace("#", "") as Tabs);
  // setCurrentNav(window.location.hash.replace("#", "") as Tabs);
  // }
  // };
  //   // setCurrentNav?.(window.location.hash.replace("#", "") as Tabs);
  //   // if (active) {
  //   //   window.location.hash = active === "/" ? "home" : `${active}`;
  //   // }
  //   // window.addEventListener("mouseup", () => {
  //   //   setcanDrag(false);
  //   // });
  // }, [active]);
  return (
    <AppContext.Provider
      value={{
        setUnReadNotiCount,
        UnReadNotiCount,
        // activeNav,
        // setActiveNav,
        // currentNav,
        // setCurrentNav,
        sortedPost,
        setsortedPost,
        headerContainerRef,
        selectMode,
        setselectMode,
        getMorePosts,
        deletePost,
        postLoading,
        postEnd,
        ...props,
        hasMore,
        posts: newsFeedPost,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext should use within AppProvider");

  return context;
};
