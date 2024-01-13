import BackHeader from "@/components/Header/BackHeader";
import PostList from "@/components/Tabs/Sections/Home/PostList";
import s from "@/components/Tabs/Sections/Profile/index.module.scss";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { SavedPost_LIMIT } from "@/lib/QUERY_LIMIT";
import { DescQuery, getPath, saveListJSON } from "@/lib/firebase";
import { verifyIdToken } from "@/lib/firebaseAdmin";
import { getPostBySavedId } from "@/lib/firestore/post";
import { Post } from "@/types/interfaces";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { Timestamp, getDocs, startAfter } from "firebase/firestore";
import { GetServerSideProps } from "next";
import nookies from "nookies";
import { useCallback, useState } from "react";
export type TSavedPost = {
  authorId: string;
  postId: string;
  createdAt: Timestamp;
};
type TInitialProps = {
  posts: Post[];
  savedPosts: TSavedPost[];
  uid: string;
  hasMore: boolean;
};
let initialProps: TInitialProps = {
  posts: [],
  savedPosts: [],
  uid: "",
  hasMore: false,
};

export const getServerSideProps: GetServerSideProps<TInitialProps> = async (
  context
) => {
  let hasMore = false;
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;
    const { uid } = token;
    const savedPostsQuery = DescQuery(
      getPath("savedPost", { uid }),
      SavedPost_LIMIT + 1
    );

    const saved = await getDocs(savedPostsQuery);
    const savedPosts = await Promise.all(
      saved.docs.map(async (doc) => (await saveListJSON(doc)) as TSavedPost)
    );

    hasMore = savedPosts.length > SavedPost_LIMIT;
    if (hasMore) {
      savedPosts.pop();
    }
    const posts = await getPostBySavedId(savedPosts, uid);

    initialProps = {
      posts,
      savedPosts,
      uid,
      hasMore,
    };
    return {
      props: {
        ...initialProps,
      },
    };
  } catch (error) {
    console.log("SSR Error " + error);
    return {
      props: {
        ...initialProps,
      },
    };
  }
};

export default function SavedPostPage(props: TInitialProps) {
  const { uid, savedPosts, posts, hasMore } = props;
  const [postLoading, setpostLoading] = useState(false);
  const [postEnd, setPostEnd] = useState(false);
  const [limitedPosts, setlimitedPosts] = useState(posts);
  const fetchMoreSavedPosts = useCallback(async () => {
    if (!hasMore) return;
    if (!savedPosts) return;
    if (postEnd) return;
    const lastPost = savedPosts[savedPosts.length - 1];

    const date = new Timestamp(
      lastPost.createdAt.seconds,
      lastPost.createdAt.nanoseconds
    );
    const savedPostsQuery = DescQuery(
      getPath("savedPost", { uid }),
      SavedPost_LIMIT,
      startAfter(date)
    );
    const saved = await getDocs(savedPostsQuery);

    const newSavedPosts = await Promise.all(
      saved.docs.map(async (doc) => (await saveListJSON(doc)) as TSavedPost)
    );
    // newSavedPosts.shift();
    const newPosts = await getPostBySavedId(newSavedPosts, uid);
    setlimitedPosts(limitedPosts.concat(newPosts));
    setpostLoading(false);
    setPostEnd(newPosts?.length! < SavedPost_LIMIT);
  }, [hasMore, limitedPosts, postEnd, savedPosts, uid]);
  const { scrollRef } = useInfiniteScroll({
    hasMore,
    scrollParent: false,
    fetchMoreData: fetchMoreSavedPosts,
  });
  return (
    <>
      <BackHeader>
        <h2>Saved Post</h2>
      </BackHeader>
      <div
        style={{
          marginTop: "65px",
          height: "calc(100vh - 65px)",
          backgroundColor: "#dadada",
          overflow: "scroll",
        }}
        className={s.container}
        ref={scrollRef}
      >
        <PostList
          posts={limitedPosts}
          postLoading={hasMore}
          postEnd={postEnd}
        />
      </div>
    </>
  );
}
