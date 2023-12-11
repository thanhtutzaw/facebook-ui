import BackHeader from "@/components/Header/BackHeader";
import PostList from "@/components/Tabs/Sections/Home/PostList";
import s from "@/components/Tabs/Sections/Profile/index.module.scss";
import { SavedPost_LIMIT } from "@/lib/QUERY_LIMIT";
import {
  DescQuery,
  db,
  getCollectionPath,
  getPath,
  getProfileByUID,
  postInfo,
  postToJSON,
} from "@/lib/firebase";
import { verifyIdToken } from "@/lib/firebaseAdmin";
import { Post, account } from "@/types/interfaces";
import { Timestamp } from "@google-cloud/firestore";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import {
  Unsubscribe,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import nookies from "nookies";
import { useEffect, useState } from "react";
type savedPostTypes = {
  authorId: string;
  postId: string;
  createdAt: Timestamp;
};
// const SavedPost_LIMIT = 10;
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;
    const { uid } = token;
    const currentUserProfile = await getProfileByUID(uid);
    const savedPostsQuery = DescQuery(getPath("savedPost", { uid }));
    const saved = await getDocs(savedPostsQuery);
    const data = saved.docs.map((doc) => doc.data()) as savedPostTypes[];
    const posts = await Promise.all(
      data.map(async (savedPost) => {
        const { authorId, postId } = savedPost;
        const postDoc = doc(
          db,
          `${getCollectionPath.posts({ uid: authorId })}/${postId}`
        );
        const posts = await getDoc(postDoc);

        const post = await postToJSON(posts);
        return await postInfo(post, uid! as string);
      })
    );
    return {
      props: {
        savedPosts: posts,
        profile: currentUserProfile,
        uid,
      },
    };
  } catch (error) {
    console.log("SSR Error " + error);
    return {
      props: {
        savedPost: [],
        profile: null,
        uid: "",
      },
    };
  }
};

export default function Page(props: {
  savedPosts: Post[];
  profile: account["profile"];
  uid: string;
}) {
  const { uid, savedPosts, profile } = props;
  const [limitedPosts, setlimitedPosts] = useState(savedPosts ?? []);
  useEffect(() => {
    setlimitedPosts(savedPosts);
  }, [savedPosts]);

  useEffect(() => {
    let unsubscribe: Unsubscribe;
    const savedPostsQuery = DescQuery(
      getPath("savedPost", { uid }),
      limitedPosts.length > 0 ? limitedPosts.length : SavedPost_LIMIT
    );
    unsubscribe = onSnapshot(savedPostsQuery, async (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data()) as savedPostTypes[];
      const posts = (await Promise.all(
        data.map(async (s) => {
          const { authorId, postId } = s;
          const postDoc = doc(
            db,
            `${getCollectionPath.posts({ uid: authorId })}/${postId}`
          );
          const posts = await getDoc(postDoc);

          const post = await postToJSON(posts);
          return await postInfo(post, uid! as string);
        })
      )) as Post[];
      setlimitedPosts(posts);
      console.log("updated posts");
    });
    return () => {
      unsubscribe();
    };
  }, [limitedPosts.length, uid]);
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
      >
        <PostList posts={limitedPosts} />
      </div>
    </>
  );
}
