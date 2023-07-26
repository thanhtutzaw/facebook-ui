import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import BackHeader from "../../components/Header/BackHeader";
import { PostList } from "../../components/Sections/Home/PostList";
import s from "../../components/Sections/Profile/index.module.scss";
import {
  app,
  db,
  fethUserDoc,
  postInfo,
  postToJSON,
  userToJSON,
} from "../../lib/firebase";
import { getUserData, verifyIdToken } from "../../lib/firebaseAdmin";
import { Post, SavedPost } from "../../types/interfaces";
// import console, { profile } from "console";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { getAuth } from "firebase/auth";
import nookies from "nookies";
import ProfileInfo from "../../components/Sections/Profile/ProfileInfo";
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;
    const { uid } = token;
    // const user = await fethUserDoc(uid);
    // const savedPosts = user.data()!.savedPost;
    const savedPosts = collection(db, `users/${uid}/savedPost`);
    const saved = await getDocs(savedPosts);
    const data = saved.docs.map((doc) => doc.data());
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
        // savedPosts: posts as Post[],
        savedPosts: posts,
        uid,
      },
    };
  } catch (error) {
    console.log("SSR Error " + error);
    return {
      props: {
        savedPost: [],
        uid: "",
      },
    };
  }
};

export default function Page(props: { savedPosts: any; uid: string }) {
  const { savedPosts } = props;
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
        {/* <p>{JSON.stringify(savedPosts)}</p> */}
        <PostList posts={savedPosts} />
        {/* <button
                onClick={async (e) => {
                  // await unSavePost(s.id?.toString());
                  // alert(s.id?.toString());
                  // const unsavedPost = savedPosts.filter(
                  //   (savepost) => savepost.postId !== s.postId
                  // );
                  // await unSavePost(unsavedPost);
                  router.push("/saved", undefined, { scroll: false });
                }}
              >
                Unsave
              </button> */}
      </div>
    </div>
  );
}
