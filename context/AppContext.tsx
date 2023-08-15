import {
  Timestamp,
  collectionGroup,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import {
  createContext,
  useEffect,
  useRef,
  useState
} from "react";
import { db, getPostWithMoreInfo } from "../lib/firebase";
import { Post, Props } from "../types/interfaces";
// const AppContext = createContext<{ user: User | null }>({ user: null });
export const AppContext = createContext<Props | null>(null);
export const LIMIT = 10;

export function AppProvider(props: Props) {
  const {
    active,
    setActive,
    setlimitedPosts,
    limitedPosts,
    account,
    username,
    profile,
    uid,
    allUsers,
    posts,
    email,
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

  // useEffect(() => {
  //   // Set up the real-time data listener
  //   const postQuery = collection(db, `posts`);
  //   const unsubscribe = postQuery.onSnapshot((snapshot) => {
  //     const updatedData = snapshot.docs.map((doc) => doc.data());
  //     setData(updatedData);
  //   });

  //   return () => {
  //     // Unsubscribe from the listener when the component unmounts
  //     unsubscribe();
  //   };
  // }, []);
  // async function fetchInfiniteData(e:UIEventHandler<HTMLDivElement, UIEvent>) {
  //   const target = e.currentTarget;
  //   if (
  //     window.innerHeight + e.currentTarget.scrollTop + 1 >=
  //     e.currentTarget.scrollHeight
  //   )
  //     return;
  // }
  async function fetchInfiniteData(e: UIEvent, postEnd: boolean | undefined) {
    const target = e.currentTarget as HTMLDivElement;
    if (
      window.innerHeight + target.scrollTop + 1 >= target.scrollHeight &&
      !postEnd
    ) {
      await getMorePosts?.();
    }
  }
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
    const finalPost = (await getPostWithMoreInfo(uid!, postQuery)) ?? [];

    setlimitedPosts?.(limitedPosts?.concat(finalPost));
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
        fetchInfiniteData,
        updatePost,
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
