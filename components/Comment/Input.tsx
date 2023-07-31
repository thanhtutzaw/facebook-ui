import { faArrowAltCircleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import s from "./index.module.scss";
import { db } from "../../lib/firebase";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import router, { useRouter } from "next/router";
export default function CommentInput(props: {
  uid?: string;
  postId: string;
  authorId: string;
}) {
  const { uid, authorId, postId } = props;
  const [text, settext] = useState("");
  const commentRef = doc(
    collection(db, `users/${authorId}/posts/${postId}/comments`)
  );
  const router = useRouter();
  return (
    <div className={s.input}>
      <input
        onChange={(e) => {
          settext(e.target.value);
        }}
        aria-label="Add Comment"
        placeholder="Add comment"
        type="text"
      />
      <button
        onClick={() => {
          console.log(postId);
          if (!uid) {
            alert("User not Found ! Sign in and Try again !");
          }
          setDoc(commentRef, {
            id: commentRef.id,
            authorId: uid,
            text,
            createdAt: serverTimestamp(),
          });
          router.replace(router.asPath, undefined, { scroll: false });
        }}
        aria-label="Submit Comment"
        tabIndex={1}
        type="submit"
      >
        <FontAwesomeIcon icon={faArrowAltCircleUp} />
      </button>
    </div>
  );
}
