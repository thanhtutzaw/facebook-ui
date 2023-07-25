import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { doc, getDoc } from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import BackHeader from "../../components/Header/BackHeader";
import { PostList } from "../../components/Sections/Home/PostList";
import s from "../../components/Sections/Profile/index.module.scss";
import {
  app,
  db,
  fethUserDoc,
  postToJSON,
  userToJSON,
} from "../../lib/firebase";
import { getUserData, verifyIdToken } from "../../lib/firebaseAdmin";
import { Post, SavedPost } from "../../types/interfaces";
// import console, { profile } from "console";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { getAuth } from "firebase/auth";
import nookies from "nookies";
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;
    const { uid } = token;
    const user = await fethUserDoc(uid);
    const savedPosts = user.data()!.savedPosts;

    const posts = await Promise.all(
      savedPosts.map(async (saved: SavedPost) => {
        const { authorId, postId } = saved;
        const postDoc = doc(db, `users/${authorId}/posts/${postId}`);
        const posts = await getDoc(postDoc);
        const post = await postToJSON(posts);
        const UserRecord = (await getUserData(post.authorId)) as UserRecord;
        const userJSON = userToJSON(UserRecord);
        return {
          ...post,
          author: {
            ...userJSON,
          },
        };
      })
    );
    return {
      props: {
        savedPosts: posts as Post[],
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

export default function Page(props: { savedPosts: Post[]; uid: string }) {
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
        {/* {JSON.stringify(savedPosts)} */}
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
