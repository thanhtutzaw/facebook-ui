import { auth } from "firebase-admin";
import { useRouter } from "next/router";
import React, { useContext, useEffect } from "react";
import BackHeader from "../../components/Header/BackHeader";
import s from "../../styles/Home.module.scss";
import CreatePostForm from "../../components/Input/CreatePostForm";
import {
  doc,
  getDoc,
  DocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { db, postToJSON, userToJSON } from "../../lib/firebase";
import { verifyIdToken, getUserData } from "../../lib/firebaseAdmin";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { Post, Props } from "../../types/interfaces";
import nookies from "nookies";
import { PageContext, PageProps } from "../../context/PageContext";
export const getServerSideProps: GetServerSideProps<any> = async (context) => {
  // context.res.setHeader(
  //   "Cache-Control",
  //   "public, s-maxage=10, stale-while-revalidate=59"
  // );
  try {
    const cookies = nookies.get(context);
    const token = await verifyIdToken(cookies.token);
    const { uid } = token;
    let expired = false;
    const { author: authorId, id: postId } = context.query;
    const isAdmin = uid === authorId;
    // const postDoc = isAdmin
    //   ? query(
    //       collection(db, `users/${authorId}/posts`),
    //       where("id", "==", postId)
    //     )
    //   : query(
    //       collection(db, `users/${authorId}/posts`),
    //       where("id", "==", postId)
    //       // where("visibility", "not-in", ["Friend", "Public"])
    //     );
    const postDoc = doc(db, `users/${authorId}/posts/${postId}`);

    const posts = await getDoc(postDoc);
    const post = await postToJSON(posts as DocumentSnapshot<DocumentData>);
    const UserRecord = await getUserData(post.authorId);
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
