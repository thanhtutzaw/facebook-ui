import { PageContext, PageProps } from "@/context/PageContext";
import useEscape from "@/hooks/useEscape";
import {
  JSONTimestampToDate,
  app,
  db,
  getCollectionPath,
} from "@/lib/firebase";
import {
  loveComment,
  unLoveComment,
  updateComment,
} from "@/lib/firestore/comment";
import {
  getMessage,
  sendAppNoti,
  sendFCM,
} from "@/lib/firestore/notifications";
import { checkPhotoURL } from "@/lib/firestore/profile";
import { Comment, Post } from "@/types/interfaces";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import { collection, doc, getCountFromServer } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { RefObject, useContext, useEffect, useRef, useState } from "react";
import AuthorInfo from "../Post/AuthorInfo";
import s from "./index.module.scss";
export default function CommentItem(props: {
  comments: Post["comments"];
  menuRef: RefObject<HTMLDivElement>;
  toggleCommentMenu: string;
  settoggleCommentMenu: Function;
  setComments: Function;
  post: Post;
  editToggle: string;
  seteditToggle: Function;
  client: boolean;
  uid: string;
  comment: Comment;
}) {
  const {
    comments,
    setComments,
    menuRef,
    toggleCommentMenu,
    settoggleCommentMenu,
    post,
    editToggle,
    seteditToggle,
    client,
    uid,
    comment,
  } = props;
  const { currentUser: profile } = useContext(PageContext) as PageProps;
  const { text, createdAt, id } = comment;
  const { authorId, id: postId } = post;
  const router = useRouter();
  const postRef = doc(db, `${getCollectionPath.posts({ uid })}/${postId}`);

  // const commentRef = doc(
  //   db,
  //   `${getCollectionPath.comments({
  //     authorId: String(post.authorId),
  //     postId: String(post.id),
  //   })}/${comment.id}`
  // );
  const commentRef = doc(
    db,
    `users/${post.authorId}/posts/${post.id}/comments/${comment.id}`
  );
  const inputRef = useRef<HTMLParagraphElement>(null);
  const [input, setInput] = useState(text);
  useEffect(() => {
    if (editToggle === id) {
      if (inputRef.current) {
        const contentEle = inputRef.current;
        const range = document.createRange();
        const selection = window.getSelection();
        console.log(contentEle.childNodes.length);
        range.setStart(contentEle, contentEle.childNodes.length);
        range.collapse(true);
        // if(!selection )return;
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [editToggle, id]);
  useEscape(() => {
    if (editToggle !== "") {
      seteditToggle("");
      settoggleCommentMenu("");
    }
  });
  function handleEditComment() {
    if (editToggle !== "") {
      seteditToggle("");
    } else {
      seteditToggle(String(id));
    }
    setTimeout(() => {
      settoggleCommentMenu("");
    }, 300);
  }

  const [updateLoading, setUpdateLoading] = useState(false);
  const [exitWithoutSaving, setexitWithoutSaving] = useState(false);
  useEffect(() => {
    if (input !== text) {
      console.log("object");
      setexitWithoutSaving(true);
    }
  }, [input, text]);
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [heartCount, setHeartCount] = useState(comment.heartCount ?? 0);
  const [heartLoading, setheartLoading] = useState(false);
  const auth = getAuth(app);
  const heartRef = doc(
    db,
    `${getCollectionPath.comments({
      authorId: String(post.authorId),
      postId: String(post.id),
    })}/${comment.id}/hearts/${auth.currentUser?.uid}`
  );
  const likedUserRef = collection(
    db,
    `${getCollectionPath.comments({
      authorId: String(post.authorId),
      postId: String(post.id),
    })}/${comment.id}/hearts`
  );

  const handleLike = async () => {
    setheartLoading(true);
    setIsLiked((prev) => !prev);
    if (!auth.currentUser?.uid) {
      alert("Error : User Not Found . Sign up and Try Again ! ");
      return;
    }
    if (isLiked) {
      await unLoveComment({ heartRef });
      await updateHeartState();
    } else {
      await loveComment({ heartRef, uid: String(auth.currentUser?.uid) });
      await updateHeartState();
      if (auth.currentUser?.uid === authorId) return;
      await sendAppNoti({
        uid,
        receiptId: comment.authorId,
        profile,
        type: "comment_reaction",
        url: `${authorId}/${postId}#comment-${comment.id}`,
      });

      await sendFCM({
        recieptId: comment.authorId.toString(),
        message: `${profile?.displayName ?? "Unknown User"} ${
          getMessage("comment_reaction").message
        }`,
        icon: checkPhotoURL(profile?.photoURL_cropped ?? profile?.photoURL),
        tag: `Heart-${id}`,
        link: `/${authorId}/${postId}#comment-${comment.id}`,
      });
    }

    async function updateHeartState() {
      setheartLoading(false);
      const updatedLikeCount = (await getCountFromServer(likedUserRef)).data()
        .count;
      setHeartCount?.(updatedLikeCount);
    }
  };
  return (
    <li key={comment.id} className={s.item} id={`comment-${id}`}>
      <AuthorInfo
        comments={comments}
        setComments={setComments}
        menuRef={menuRef}
        toggleCommentMenu={toggleCommentMenu}
        settoggleCommentMenu={settoggleCommentMenu}
        handleEditComment={handleEditComment}
        postRef={postRef}
        commentRef={commentRef}
        isAdmin={uid === authorId}
        comment={comment}
        style={{
          backgroundColor:
            client && router.asPath.match(id?.toString()!)
              ? "#e9f3ff"
              : "initial",
        }}
      >
        <div
          className={`${
            editToggle === id
              ? "border-b-black border-b border-solid"
              : "border-b-transparent border-b border-solid"
          } p-[0_0_5px] max-h-20 overflow-scroll transition-all duration-500 ease-in-out
            `}
        >
          <p
            ref={inputRef}
            key={editToggle}
            suppressContentEditableWarning={true}
            contentEditable={editToggle === id}
            className={`p-3 focus-visible:outline-0 ${s.text}`}
          >
            {input}
          </p>
        </div>
        <div className={s.actions}>
          <p suppressHydrationWarning>
            {JSONTimestampToDate(createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          <button
            disabled={heartLoading}
            style={{
              pointerEvents: heartLoading ? "none" : "initial",
            }}
            onClick={async () => {
              await handleLike();
            }}
            aria-label="Love this Comment"
            title="Love"
            tabIndex={-1}
            className={s.replyBtn}
          >
            <FontAwesomeIcon
              style={{ color: isLiked ? "red" : "rgb(78, 78, 78)" }}
              icon={faHeart}
            />
            {heartCount > 0 && heartCount}
          </button>
          <button className={s.replyBtn}>Reply</button>
        </div>
        <div
          style={{ gridTemplateRows: editToggle === id ? "1fr" : "0fr" }}
          className={`grid transition-all duration-300 ease-in-out  `}
        >
          <AnimatePresence>
            {editToggle === id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-2 overflow-hidden"
              >
                <button
                  className="h-[34px] rounded-md p-[5px_10px] text-[16px]"
                  onClick={() => {
                    setInput(text);
                    seteditToggle("");
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={updateLoading}
                  onClick={async () => {
                    const editedComment = inputRef.current?.innerText;
                    const target = `${getCollectionPath.comments({
                      authorId: String(post.authorId),
                      postId: String(post.id),
                    })}/${comment.id}`;
                    const data = { ...comment, text: editedComment! };
                    try {
                      setUpdateLoading(true);
                      await updateComment(target, data);
                      setInput(editedComment ?? input);
                      setUpdateLoading(false);
                      seteditToggle("");
                    } catch (error) {
                      alert("Failed updating comment ! " + error);
                      setInput(text);
                      setUpdateLoading(false);
                      console.log(error);
                    }
                  }}
                  className="h-[34px] flex justify-center items-center rounded-md bg-primary text-white p-[5px_10px]    text-[16px]"
                >
                  <span
                    className={`absolute ${
                      updateLoading ? "opacity-1" : "opacity-0"
                    }`}
                  >
                    <Spin />
                  </span>
                  <span
                    className={`${updateLoading ? "opacity-0" : "opacity-1"}`}
                  >
                    Submit
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AuthorInfo>
    </li>
  );
  function Spin() {
    return (
      <div className="loading" style={{ margin: "0" }}>
        <div
          className="spinner"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <div
            style={{
              width: `${16}px`,
              height: `${16}px`,
              borderTopColor: "white !important",
              borderLeftColor: "white !important",
            }}
            className="spinner-icon white"
          ></div>
        </div>
      </div>
    );
  }
}
