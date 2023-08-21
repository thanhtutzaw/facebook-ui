import {
  Unsubscribe,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import BackHeader from "../../components/Header/BackHeader";
import { PostList } from "../../components/Sections/Home/PostList";
import s from "../../components/Sections/Profile/index.module.scss";
import {
  db,
  getPostWithMoreInfo,
  getProfileByUID,
  postInfo,
  postToJSON,
} from "../../lib/firebase";
import { verifyIdToken } from "../../lib/firebaseAdmin";
// import console, { profile } from "console";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import nookies from "nookies";
import { Post, account } from "../../types/interfaces";
import { useEffect, useState } from "react";
import { Timestamp } from "@google-cloud/firestore";
type savedPostTypes = {
  authorId: string;
  postId: string;
  createdAt: Timestamp;
};
const LIMIT = 10;
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;
    const { uid } = token;
    const currentUserProfile = await getProfileByUID(uid);
    const savedPostsQuery = query(
      collection(db, `users/${uid}/savedPost`),
      orderBy("createdAt", "desc"),
      limit(LIMIT)
    );
    const saved = await getDocs(savedPostsQuery);
    const data = saved.docs.map((doc) => doc.data()) as savedPostTypes[];
    // console.log(data[0].);
    const posts = await Promise.all(
      data.map(async (s: any) => {
        const { authorId, postId } = s;
        const postDoc = doc(db, `users/${authorId}/posts/${postId}`);
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
    // if (limitedPosts.length <= 0) return;
    let unsubscribe: Unsubscribe;
    const savedPostsQuery = query(
      collection(db, `users/${uid}/savedPost`),
      orderBy("createdAt", "desc"),
      limit(limitedPosts.length > 0 ? limitedPosts.length : LIMIT)
    );
    unsubscribe = onSnapshot(savedPostsQuery, async (snapshot) => {
      // const saved = await getDocs(savedPostsQuery);
      const data = snapshot.docs.map((doc) => doc.data()) as savedPostTypes[];
      const posts = (await Promise.all(
        data.map(async (s) => {
          const { authorId, postId } = s;
          const postDoc = doc(db, `users/${authorId}/posts/${postId}`);
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
    <div className="user">
      <BackHeader>
        <h2>Saved Post</h2>
      </BackHeader>
      <div
        style={{
          marginTop: "65px",
          height: "calc(100vh - 65px)",
          backgroundColor: "#dadada",
        }}
        className={s.container}
      >
        <PostList profile={profile} posts={limitedPosts} />
      </div>
    </div>
  );
}
