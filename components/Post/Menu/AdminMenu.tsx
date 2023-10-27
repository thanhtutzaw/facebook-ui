import useQueryFn from "@/hooks/useQueryFn";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import router from "next/router";
import { useContext, useState } from "react";
import { PostContext, PostProps } from "../../../context/PostContext";
import { app, getCollectionPath } from "../../../lib/firebase";
import { deletePost } from "../../../lib/firestore/post";
import styles from "../index.module.scss";
import { CopyLink } from "./Menu";
export default function AdminMenu(props: {
  updatePost: Function;
  authorId: string | number;
  id: string;
}) {
  const { updatePost, authorId, id } = props;
  const { post, toggleMenu, settoggleMenu } = useContext(
    PostContext
  ) as PostProps;
  const auth = getAuth(app);
  const [loading, setLoading] = useState(false);
  const { queryFn } = useQueryFn();
  // const deletePostMutation = useMutation({
  //   mutationFn: async (data: any) => await deletePost(data),
  //   onSuccess: (data) => {
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
              const uid = auth?.currentUser?.uid;
              e.preventDefault();
              e.stopPropagation();
              if (uid !== authorId) {
                alert("Not Allowed ! Mismatch userId and authorId");
                throw new Error("Not Allowed");
              }
              setLoading(true);
              try {
                console.log({ post });
                // const deleteURL = post.deletedByAuthor
                //   ? `${getCollectionPath.recentPosts({
                //       uid: String(post.authorId),
                //     })}/${post.recentId}`
                //   : `${getCollectionPath.posts({
                //       uid,
                //     })}/${String(id)}`;
                if (!post.deletedByAuthor) {
                  await deletePost({
                    uid,
                    post,
                    deleteURL: `${getCollectionPath.posts({
                      uid,
                    })}/${String(id)}`,
                  });
                }
                if (post.recentId) {
                  await deletePost({
                    uid,
                    deleteURL: `${getCollectionPath.recentPosts({
                      uid: String(post.authorId),
                    })}/${post.recentId}`,
                    post,
                  });
                }
                // await deletePost({
                //   uid,
                //   post,
                //   deleteURL,
                // });
                // if (!post.deletedByAuthor) {
                //   const deleteURL = `${getCollectionPath.recentPosts({
                //     uid,
                //   })}/${post.recentId}`;
                //   await deletePost({
                //     uid,
                //     post,
                //     deleteURL,
                //   });
                //   updatePost(id);
                // }
                setLoading(false);
                settoggleMenu?.("");
                queryFn.refetchQueries("myPost");
                queryFn.invalidate("myPost");
                // deletePostMutation.mutate({
                //   uid: auth.currentUser.uid,
                //   postid: id!,
                //   post,
                // });
                if (post.recentId) {
                  updatePost(id);
                } else {
                  updatePost(id, true);
                }
                if (loading) return;
                // if (post.deletedByAuthor) {
                //   updatePost(post.recentId, post.deletedByAuthor);
                // } else {

                // }
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
