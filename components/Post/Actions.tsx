import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import router from "next/router";
import { deletePost } from "../../lib/firestore/post";
import styles from "./Post.module.scss";
import { getAuth } from "firebase/auth";
import { app } from "../../lib/firebase";
import { motion } from "framer-motion";
function Actions(props: {
  authorId: string | number;
  id: string;
  setshowAction: Function;
}) {
  const { authorId, id, setshowAction } = props;
  const auth = getAuth(app);
  return (
    <>
      <button
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();

          // if (auth.currentUser?.uid !== authorId) {
          //   alert("Not Allowed ! Mismatch userId and authorId");
          //   throw new Error("Not Allowed");
          // }

          // try {
          //   await deletePost(auth.currentUser?.uid!, id?.toString()!);
          //   router.replace("/", undefined, {
          //     scroll: false,
          //   });
          // } catch (error: any) {
          //   alert(error.message);
          // } finally {
          //   setshowAction?.("");
          // }
        }}
      >
        <FontAwesomeIcon icon={faEdit} />
        Edit
      </button>
      <button
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (auth.currentUser?.uid !== authorId) {
            alert("Not Allowed ! Mismatch userId and authorId");
            throw new Error("Not Allowed");
          }

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
            setshowAction?.("");
          }
        }}
      >
        <FontAwesomeIcon icon={faTrash} />
        Delete
      </button>
    </>
  );
}

export default Actions;
