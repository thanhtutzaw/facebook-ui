import { UserRecord } from "firebase-admin/lib/auth/user-record";
import {
  DocumentData,
  DocumentSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import nookies from "nookies";
import { db, getCollectionPath, postToJSON, userToJSON } from "../../lib/firebase";
import { getUserData, verifyIdToken } from "../../lib/firebaseAdmin";
import { Post } from "../../types/interfaces";
import CreatePostForm from "@/components/Form/CreatePost";
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookies = nookies.get(context);
    const token = await verifyIdToken(cookies.token);
    const { uid } = token;
    const { author: authorId, id: postId } = context.query;
    const postDoc = doc(
      db,
      `${getCollectionPath.posts({ uid: String(authorId) })}/${postId}`
    );

    const posts = await getDoc(postDoc);
    const post = await postToJSON(posts as DocumentSnapshot<DocumentData>);
    const UserRecord = await getUserData(String(post.authorId));
    const userJSON = userToJSON(UserRecord) as UserRecord;
    const sharePost = {
      ...post,
      author: {
        ...userJSON,
      },
    };
    if (
      !posts.exists() ||
      (uid !== post.authorId && post.visibility === "Onlyme")
    ) {
      return {
        notFound: true,
      };
    } else {
      return {
        props: {
          post: sharePost,
        },
      };
    }
  } catch (error) {
    console.log("SSR Error " + error);
    return {
      props: {
        post: {},
      },
    };
  }
};
export default function Page(props: { post: Post }) {
  const { post } = props;

  return <CreatePostForm sharePost={post} />;
}
