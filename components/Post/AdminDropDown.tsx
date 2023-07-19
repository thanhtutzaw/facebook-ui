import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import router from "next/router";
import { app } from "../../lib/firebase";
import { deletePost } from "../../lib/firestore/post";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./index.module.scss";
import { CopyLink } from "./DropDown";
function AdminDropDown(props: {
  setshowAction: Function;
  showAction: string;
  authorId: string | number;
  id: string;
}) {
  const { setshowAction, authorId, id, showAction } = props;
  const auth = getAuth(app);
  const [loading, setLoading] = useState(false);
  return (
    <AnimatePresence>
      {showAction === id && (
        <motion.div
          key={id}
          initial={{
            opacity: "0",
            scale: 0.8,
          }}
          animate={{
            opacity: showAction === id ? 1 : 0,
            scale: 1,
          }}
          exit={{
            opacity: "0",
            scale: 0.8,
          }}
          transition={{
            duration: 0.15,
          }}
          className={styles.actions}
        >
          <CopyLink
            showAction={showAction}
            setshowAction={setshowAction}
            authorId={authorId.toString()}
            id={id.toString()}
          />

          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push({
                pathname: `${authorId}/${id?.toString()}`,
                query: { edit: true },
              });
              setshowAction("");
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AdminDropDown;
