import { Comment } from "@/types/interfaces";
import {
  faEdit,
  faEllipsisV,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DocumentData, DocumentReference } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import router from "next/router";
import { useState } from "react";
import { deleteComment } from "../../lib/firestore/comment";
import s from "@/components/Tabs/Sections/Profile/index.module.scss";
export default function CommentAction(props: {
  toggleCommentMenu: string;
  settoggleCommentMenu: Function;
  handleEditComment: Function;
  commentRef: DocumentReference<DocumentData>;
  postRef: DocumentReference<DocumentData>;
  comment: Comment;
}) {
  const {
    toggleCommentMenu,
    settoggleCommentMenu,
    comment,
    handleEditComment,
    commentRef,
    postRef,
  } = props;
  // const { toggleCommentMenu, settoggleCommentMenu } = useContext(
  //   PageContext
  // ) as PageProps;
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { id } = comment;
  return (
    <>
      <button
        onClick={() => {
          toggleCommentMenu
            ? settoggleCommentMenu("")
            : settoggleCommentMenu(id);
        }}
      >
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      <AnimatePresence>
        {toggleCommentMenu === id && (
          <motion.div
            key={id}
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: toggleCommentMenu === id ? 1 : 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
            }}
            transition={{
              duration: 2,
            }}
            className={`items-center right-0
    top-[2.5rem]
} ${s.menuContainer}`}
          >
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEditComment();
                // router.push({
                //   pathname: `${authorId}/${id?.toString()}`,
                //   query: { edit: true },
                // });
              }}
            >
              <FontAwesomeIcon icon={faEdit} />
              Edit
            </button>
            <button
              onClick={async () => {
                setDeleteLoading(true);

                try {
                  if (!commentRef || !postRef)
                    throw new Error("CommentRef and PostRef are required !");
                  await deleteComment(commentRef, postRef);
                  setDeleteLoading(false);
                  settoggleCommentMenu("");
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
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
