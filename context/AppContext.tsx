import { useRef, useState, useEffect } from "react";
import { createContext } from "react";
import { useActive } from "../hooks/useActiveTab";
import { Post, Props, account } from "../types/interfaces";
import { useRouter } from "next/router";
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
import { db, postToJSON } from "../lib/firebase";
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
    const newPostsDoc = await getDocs(postQuery);
    const newPosts = newPostsDoc.docs.map((doc) => doc.data()) as Post[];

    const withLike = (await Promise.all(
      newPosts.map(async (p) => {
        if (p) {
          const profileQuery = doc(db, `/users/${p.authorId}`);
          console.log(p.authorId);
          const profileSnap = await getDoc(profileQuery);
          const profileData = profileSnap.data()!;
          const profile = profileData?.profile as account["profile"];
          const postRef = doc(db, `users/${p.authorId}/posts/${p.id}`);
          const likeRef = collection(postRef, "likes");
          const likeDoc = await getDocs(likeRef);
          const likedByUser = doc(
            db,
            `users/${p.authorId}/posts/${p.id}/likes/${uid}`
          );
          const isLiked = await getDoc(likedByUser);
          const like = likeDoc.docs.map((doc) => doc.data());

          if (!likeDoc.empty) {
            return {
              ...p,
              author: { ...profile },
              like: [...like],
              isLiked: isLiked.exists() ? true : false,
            };
          } else {
            return {
              ...p,
              author: { ...profile },
              isLiked: false,
            };
          }
        }
      })
    )) as Post[];
    const sharePosts = await Promise.all(
      withLike.map(async (p) => {
        if (p.sharePost) {
          const postDoc = doc(
            db,
            `users/${p.sharePost?.author}/posts/${p.sharePost?.id}`
          );
          const posts = await getDoc(postDoc);
          if (posts.exists()) {
            const post = await postToJSON(
              posts as DocumentSnapshot<DocumentData>
            );

            const profileQuery = doc(db, `/users/${post.authorId}`);
            const profileSnap = await getDoc(profileQuery);
            const profileData = profileSnap.data()!;
            const profile = profileData.profile as account["profile"];
            // const UserRecord = await getUserData(post.authorId);
            // const userJSON = userToJSON(UserRecord);
            const sharePost = {
              ...post,
              author: { ...profile },
            };
            return {
              ...p,
              sharePost: { ...p.sharePost, post: { ...sharePost } },
            };
          } else {
            return {
              ...p,
              sharePost: { ...p.sharePost, post: null },
            };
          }
        }
        return {
          ...p,
        };
      })
    );
    const finalPost = (await Promise.all(
      sharePosts.map(async (p) => {
        if (p.sharePost?.post) {
          const post = p.sharePost.post!;
          const postRef = doc(db, `users/${post.authorId}/posts/${post.id}`);
          const likeRef = collection(postRef, "likes");
          const likeDoc = await getDocs(likeRef);
          const likedByUser = doc(
            db,
            `users/${post.authorId}/posts/${post.id}/likes/${uid}`
          );
          const isLiked = await getDoc(likedByUser);
          const like = likeDoc.docs.map((doc) => doc.data());

          const shareData = {
            ...p,
            sharePost: {
              ...p.sharePost,
              post: {
                ...post,
                like: [...like],
                isLiked: isLiked.exists() ? true : false,
              },
            },
          };
          return shareData;
        }
        return {
          ...p,
        };
      })
    )) as Post[];
    // setlimitedPosts({ ...limitedPosts, ...newPosts });
    setlimitedPosts(limitedPosts?.concat(finalPost));
    console.log(newPosts);
    setpostLoading(false);
    if (newPosts.length < LIMIT) {
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
