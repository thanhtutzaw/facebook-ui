import post from "@/components/Post/index.module.scss";
import s from "@/components/Tabs/Sections/Profile/index.module.scss";
import useEscape from "@/hooks/useEscape";
import { deleteComment } from "@/lib/firestore/comment";
import { Comment } from "@/types/interfaces";
import {
  faEdit,
  faEllipsisV,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DocumentData, DocumentReference } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { RefObject, useEffect, useState } from "react";
interface CommentActionProps {
  parentId: string;
  nested: boolean;
  isAdmin: boolean;
  setComments: Function;
  menuRef: RefObject<HTMLDivElement>;
  toggleCommentMenu: string;
  settoggleCommentMenu: Function;
  handleEditComment: Function;
  commentRef: DocumentReference<DocumentData>;
  postRef: DocumentReference<DocumentData>;
  comment: Comment;
  setisDropDownOpenInNestedComment: Function;
}
export default function CommentAction({
  parentId,
  nested,
  isAdmin,
  setComments,
  menuRef,
  toggleCommentMenu,
  settoggleCommentMenu,
  handleEditComment,
  commentRef,
  postRef,
  comment,
  setisDropDownOpenInNestedComment,
}: CommentActionProps) {
  const [deleteLoading, setDeleteLoading] = useState(false);
  useEscape(() => {
    toggleCommentMenu && settoggleCommentMenu("");
  });
  const router = useRouter();
  function updateNestedComment({
    reply,
    recentReply,
  }: {
    reply: (c: Comment) => Partial<Comment>;
    recentReply: (c: Comment) => Partial<Comment>;
  }) {
    setComments((prev: Comment[]) =>
      prev.map((c) => {
        if (c.id === parentId) {
          if (c.recentReplies) {
            return {
              ...c,
              ...recentReply(c),
            };
          } else {
            return {
              ...c,
              ...reply(c),
            };
          }
        }
        return c;
      })
    );
  }
  // useEffect(() => {
  //   console.log("hi");
  //   menuRef && menuRef.current && console.log(menuRef.current);
  // }, [menuRef]);

  return (
    <>
      {isAdmin && (
        <>
          <button
            className={post.dot}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleCommentMenu
                ? settoggleCommentMenu("")
                : settoggleCommentMenu(comment.id);
              // if (!setisDropDownOpenInNestedComment) return;
              toggleCommentMenu
                ? setTimeout(() => {
                    setisDropDownOpenInNestedComment(false);
                  }, 200)
                : setisDropDownOpenInNestedComment(true);
            }}
          >
            <FontAwesomeIcon icon={faEllipsisV} />
          </button>
          <AnimatePresence>
            {toggleCommentMenu === comment.id && (
              <motion.div
                ref={menuRef}
                key={comment.id}
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: toggleCommentMenu === comment.id ? 1 : 0,
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
                  style={{
                    minWidth: "148px",
                  }}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditComment();
                  }}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Edit
                </button>
                <button
                  style={{
                    minWidth: "148px",
                  }}
                  onClick={async () => {
                    setDeleteLoading(true);

                    console.log("delete comment path- " + commentRef.path);
                    try {
                      if (!commentRef || !postRef) {
                        throw new Error(
                          "CommentRef and PostRef are required !"
                        );
                      }
                      await deleteComment(commentRef, postRef);
                      if (nested) {
                        updateNestedComment({
                          recentReply: (c) => {
                            return {
                              replyCount: c.replyCount ? c.replyCount - 1 : 0,
                              recentReplies: c.recentReplies?.filter(
                                (recentreply) => recentreply.id !== comment.id
                              ),
                            };
                          },
                          reply: (c) => {
                            return {
                              replyCount: c.replyCount ? c.replyCount - 1 : 0,
                              replies: c.replies.filter(
                                (reply) => reply.id !== comment.id
                              ),
                            };
                          },
                        });
                      } else {
                        setComments((prev: Comment[]) =>
                          prev.filter((c) => c.id !== comment.id)
                        );
                      }
                      setDeleteLoading(false);
                      settoggleCommentMenu("");
                      router.push(router.asPath);
                    } catch (error: unknown) {
                      console.error(error);
                      alert(error);
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
      )}
    </>
  );
}
