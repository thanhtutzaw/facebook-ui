import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import router from "next/router";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { app } from "../../../lib/firebase";
import { deletePost } from "../../../lib/firestore/post";
import { Post } from "../../../types/interfaces";
import { CopyLink } from "./Menu";
import styles from "../index.module.scss";
import { useQueryClient } from "@tanstack/react-query";
import { PostProps, PostContext } from "../PostContext";
export default function AdminMenu(props: {
  updatePost: Function;
  authorId: string | number;
  id: string;
}) {
  const { updatePost,authorId, id} = props;
  const { post , toggleMenu, settoggleMenu} = useContext(PostContext) as PostProps;
  const auth = getAuth(app);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  // const deletePostMutation = useMutation({
  //   mutationFn: async (data: any) => await deletePost(data),
  //   onSuccess: (data) => {
  //     queryClient.invalidateQueries(["myPost"]);
  //     console.log("Delete Mutate Success " + data);
  //     setLoading(false);
  //     settoggleMenu?.("");
  //   },
  // });
  return (
    <AnimatePresence>
      {toggleMenu === id && (
        <motion.div
          key={id}
          initial={{
            opacity: "0",
            scale: 0.8,
          }}
          animate={{
            opacity: toggleMenu === id ? 1 : 0,
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
            toggleMenu={toggleMenu}
            settoggleMenu={settoggleMenu}
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
              settoggleMenu("");
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
                settoggleMenu?.("");
                queryClient.refetchQueries(["myPost"]);
                queryClient.invalidateQueries(["myPost"]);
                // deletePostMutation.mutate({
                //   uid: auth.currentUser.uid,
                //   postid: id!,
                //   post,
                // });
                if (loading) return;
                updatePost(id);
              } catch (error: any) {
                settoggleMenu?.("");
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
