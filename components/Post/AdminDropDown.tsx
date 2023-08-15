import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import router from "next/router";
import { app } from "../../lib/firebase";
import { deleteMultiple, deletePost } from "../../lib/firestore/post";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./index.module.scss";
import { CopyLink } from "./DropDown";
import { Post } from "../../types/interfaces";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import error from "next/error";
import { auth } from "firebase-admin";

export default function AdminDropDown(props: {
  updatePost: Function;
  setshowAction: Function;
  showAction: string;
  authorId: string | number;
  id: string;
  post?: Post;
}) {
  const { updatePost, post, setshowAction, authorId, id, showAction } = props;
  const auth = getAuth(app);
  const [loading, setLoading] = useState(false);
  // const queryClient = useQueryClient();

  // const deletePostMutation = useMutation({
  //   mutationFn: async (data: any) => await deletePost(data),
  //   onSuccess: (data) => {
  //     queryClient.invalidateQueries(["myPost"]);
  //     console.log("Delete Mutate Success " + data);
  //     setLoading(false);
  //     setshowAction?.("");
  //   },
  // });
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
                await deletePost({
                  uid: auth.currentUser.uid,
                  postid: id,
                  post,
                });
                // queryClient.invalidateQueries(["myPost"]);
                setLoading(false);
                setshowAction?.("");
                // deletePostMutation.mutate({
                //   uid: auth.currentUser.uid,
                //   postid: id!,
                //   post,
                // });
                if (loading) return;
                updatePost(id);
              } catch (error: any) {
                setshowAction?.("");
                console.error(error);
                setLoading(false);
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
