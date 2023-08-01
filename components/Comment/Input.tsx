import { faArrowAltCircleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import s from "./index.module.scss";
import { db } from "../../lib/firebase";
import {
  collection,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { Post } from "../../types/interfaces";
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
  const batch = writeBatch(db);
  const previousCommentCount = post?.comments.length ?? 0;
  return (
    <form className={s.input}>
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
      onClick={async () => {
          if (!uid) {
            alert("User not Found ! Sign in and Try again !");
          }
          if (text === "") return;
          try {
            setaddLoading(true);
            batch.set(commentRef, {
              id: commentRef.id,
              authorId: uid,
              text,
              createdAt: serverTimestamp(),
            });
            batch.update(postRef, {
              commentCount: previousCommentCount + 1,
            });
            await batch.commit();
            router.replace(router.asPath, undefined, { scroll: false });
            settext("");
            setaddLoading(false);
          } catch (error: any) {
            console.log(error);
            alert(error.message);
            setaddLoading(false);
          }
        }}
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
