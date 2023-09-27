import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import router from "next/router";
import { useState } from "react";
import { deleteComment } from "../../lib/firestore/comment";
import { DocumentReference, DocumentData } from "firebase/firestore";

export default function CommentAction(props: {
  commentRef: DocumentReference<DocumentData>;
  postRef: DocumentReference<DocumentData>;
}) {
  const { commentRef, postRef } = props;
  const [deleteLoading, setDeleteLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        setDeleteLoading(true);

        try {
          if (!commentRef || !postRef)
            throw new Error("CommentRef and PostRef are required !");
          await deleteComment(commentRef, postRef);
          setDeleteLoading(false);
          router.push(router.asPath);
        } catch (error: any) {
          console.error(error);
          alert(error.message);
          setDeleteLoading(false);
        }
      }}
      aria-label="Delete Comment"
      disabled={deleteLoading}
    >
      <FontAwesomeIcon icon={faTrash} />
    </button>
  );
}
