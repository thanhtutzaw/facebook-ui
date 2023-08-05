import { faArrowAltCircleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  DocumentData,
  DocumentReference,
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useState } from "react";
import { db } from "../../lib/firebase";
import { Post } from "../../types/interfaces";
import s from "./index.module.scss";
import { addComment } from "../../lib/firestore/comment";
export default function CommentInput(props: {
  uid?: string;
  postId: string;
  authorId: string;
  post?: Post;
}) {
  const { post, uid, authorId, postId } = props;
  const [text, settext] = useState("");
  const commentRef = doc(
    collection(db, `users/${authorId}/posts/${postId}/comments`)
  );
  const router = useRouter();
  const [addLoading, setaddLoading] = useState(false);
  const postRef = doc(db, `users/${authorId}/posts/${postId}`);
  const previousCommentCount = post?.comments.length ?? 0;
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!uid) {
          alert("User not Found ! Sign in and Try again !");
          throw Error;
        }
        if (text === "") return;
        try {
          setaddLoading(true);
          await addComment(
            commentRef,
            uid,
            text,
            postRef,
            previousCommentCount
          );
          router.replace(router.asPath, undefined, { scroll: false });
          settext("");
          setaddLoading(false);
        } catch (error: any) {
          console.log(error);
          alert(error.message);
          setaddLoading(false);
        }
      }}
      className={s.input}
    >
      <input
        onChange={(e) => {
          settext(e.target.value);
        }}
        value={text}
        aria-label="Add Comment"
        placeholder="Add comment"
        type="text"
      />
      <button
        aria-label="Submit Comment"
        tabIndex={1}
        type="submit"
        disabled={addLoading}
      >
        <FontAwesomeIcon icon={faArrowAltCircleUp} />
      </button>
    </form>
  );
}
