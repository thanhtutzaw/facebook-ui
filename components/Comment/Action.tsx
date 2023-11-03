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
import { RefObject, useEffect, useRef, useState } from "react";
import { deleteComment } from "../../lib/firestore/comment";
import s from "@/components/Tabs/Sections/Profile/index.module.scss";
import useEscape from "@/hooks/useEscape";
import post from '@/components/Post/index.module.scss'
export default function CommentAction(props: {
  menuRef: RefObject<HTMLDivElement>;
  toggleCommentMenu: string;
  settoggleCommentMenu: Function;
  handleEditComment: Function;
  commentRef: DocumentReference<DocumentData>;
  postRef: DocumentReference<DocumentData>;
  comment: Comment;
}) {
  const {
    menuRef,
    toggleCommentMenu,
    settoggleCommentMenu,
    comment,
    handleEditComment,
    commentRef,
    postRef,
  } = props;
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { id } = comment;
  useEscape(() => {
    toggleCommentMenu && settoggleCommentMenu("");
  });

  return (
    <>
      <button
      className={post.dot}
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
            ref={menuRef}
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
              type: "spring",
            }}
            className={`
            
                flex flex-col max-w-none
            will-change-[scale] items-center right-4 top-[2.5rem] ${s.menuContainer}`}
          >
            <button
              style={{ minWidth: "148px" }}
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
              style={{ minWidth: "148px" }}
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
