import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { ReactNode, createContext, useContext, useRef, useState } from "react";
import { AppProps, Post, Tabs } from "../types/interfaces";
export interface Props {
  setprofileSrc: Function;
  profileSrc: string;
  // hasMore: boolean;
  token: DecodedIdToken | null | undefined;
  // setnewsFeedPost: Function;
  // newsFeedPost: Post[];
  uid: string;
  active: Tabs;
  // posts: Post[];
  children: ReactNode;
}
export const AppContext = createContext<AppProps | null>(null);
export function AppProvider(props: Props) {
  // const { hasMore, uid, posts } = props;

  // const { active } = useActiveTab();
  const [UnReadNotiCount, setUnReadNotiCount] = useState(0);
  const [selectMode, setselectMode] = useState(false);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const [sortedPost, setsortedPost] = useState<Post[]>([]);
  // const deletePost = useCallback(
  //   (id: string) => {
  //     setnewsFeedPost((prev: Post[]) => prev.filter((post) => post.id !== id));
  //   },
  //   [setnewsFeedPost]
  // );

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
        sortedPost,
        setsortedPost,
        headerContainerRef,
        selectMode,
        setselectMode,
        // getMorePosts,
        // deletePost,
        // postLoading,
        // postEnd,
        ...props,
        // hasMore,
        // posts: newsFeedPost,
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
