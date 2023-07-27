import { useRef, useState, useEffect } from "react";
import { createContext } from "react";
import { useActive } from "../hooks/useActiveTab";
import { Post, Props, account } from "../types/interfaces";
import {
  query,
  collectionGroup,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  Timestamp,
  collection,
  doc,
  getDoc,
  DocumentData,
  DocumentSnapshot,
} from "firebase/firestore";
import { db, getPostWithMoreInfo, postToJSON } from "../lib/firebase";
// const AppContext = createContext<{ user: User | null }>({ user: null });
export const AppContext = createContext<Props | null>(null);
export const LIMIT = 10;

export function AppProvider(props: Props) {
  const { account, username, profile, uid, allUsers, posts, email } = props;
  const [limitedPosts, setlimitedPosts] = useState(posts);
  const [postLoading, setpostLoading] = useState(false);
  const [postEnd, setPostEnd] = useState(false);
  const { active, setActive } = useActive();
  const [selectMode, setselectMode] = useState(false);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const [sortedPost, setsortedPost] = useState<Post[]>([]);
  async function getMorePosts() {
    setpostLoading(true);
    const post = posts?.[posts?.length - 1]!;
    const date = new Timestamp(
      post.createdAt.seconds,
      post.createdAt.nanoseconds
    );
    const postQuery = query(
      collectionGroup(db, `posts`),
      where("visibility", "in", ["Friend", "Public"]),
      orderBy("createdAt", "desc"),
      startAfter(date),
      limit(LIMIT)
    );
    const finalPost = await getPostWithMoreInfo(postQuery, uid!);

    setlimitedPosts(limitedPosts?.concat(finalPost));
    setpostLoading(false);
    if (finalPost.length < LIMIT) {
      setPostEnd(true);
    }
  }
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
        // main.scrollTo({
        //   top: 0,
        //   behavior: "smooth",
        // });
        main.style.scrollSnapType = "none";
        if (!headerContainer) return;
        headerContainer.style.transform = "translateY(-60px)";
        headerContainer.style.height = "60px";
      }
    };

    // if (active === "/") window.location.hash = "#home";
  }, [active]);
  return (
    <AppContext.Provider
      value={{
        username,
        profile,
        sortedPost,
        setsortedPost,

        headerContainerRef,
        selectMode,
        setselectMode,
        active,
        setActive,
        uid,
        allUsers,
        posts: limitedPosts,
        setlimitedPosts,
        postLoading,
        postEnd,
        email,
        account,
        getMorePosts,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
