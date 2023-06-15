import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import router from "next/router";
import { app } from "../../lib/firebase";
import { deletePost } from "../../lib/firestore/post";
import { useState } from "react";
function Actions(props: {
  authorId: string | number;
  id: string;
  setshowAction: Function;
}) {
  const { authorId, id, setshowAction } = props;
  const auth = getAuth(app);
  const [loading, setLoading] = useState(false);
  return (
    <>
      <button
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push({
            pathname: `${authorId}/${id?.toString()}`,
            query: { edit: true },
          });
        }}
      >
        <FontAwesomeIcon icon={faEdit} />
        Edit
      </button>
      <button
        disabled={loading}
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (auth.currentUser?.uid !== authorId) {
            alert("Not Allowed ! Mismatch userId and authorId");
            throw new Error("Not Allowed");
          }
          setLoading(true);
          try {
            await deletePost(auth.currentUser?.uid!, id!);
            router.replace("/", undefined, {
              scroll: false,
            });
          } catch (error: any) {
            alert(error.message);
          } finally {
            router.replace("/", undefined, {
              scroll: false,
            });
            // setshowAction?.("");
          }
        }}
      >
        <FontAwesomeIcon icon={faTrash} />
        {loading ? "Deleting" : "Delete"}
      </button>
    </>
  );
}

export default Actions;
