import useEscape from "@/hooks/useEscape";
import {
  db,
  getCollectionPath,
  getPath,
  JSONTimestampToDate,
} from "@/lib/firebase";
import { Comment, Post } from "@/types/interfaces";
import { doc } from "firebase/firestore";
import { useRouter } from "next/router";
import { RefObject, useEffect, useRef, useState } from "react";
import AuthorInfo from "../Post/AuthorInfo";
import s from "./index.module.scss";
import { updateComment } from "@/lib/firestore/comment";
import Spinner from "../Spinner";
function CommentItem(props: {
  menuRef: RefObject<HTMLDivElement>;
  toggleCommentMenu: string;
  settoggleCommentMenu: Function;

  post: Post;
  editToggle: string;
  seteditToggle: Function;
  client: boolean;
  uid: string;
  comment: Comment;
}) {
  const {
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
  const { text, createdAt, id } = comment;
  const { authorId, id: postId } = post;
  const router = useRouter();
  const postRef = doc(db, `${getPath("posts", { uid })}/${postId}`);
  const commentRef = doc(
    db,
    `${getCollectionPath.comments({
      authorId: String(post.authorId),
      postId: String(post.id),
    })}/${comment.id}`
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
  return (
    <li key={comment.id} className={s.item} id={`comment-${id}`}>
      <AuthorInfo
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
            onChange={(e) => {
              setInput(e.currentTarget.innerText);
            }}
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
          <button className={s.replyBtn}>Reply</button>
        </div>
        {editToggle === id && (
          <div className="flex gap-2">
            <button
              className="rounded-md p-[5px_10px] text-[16px]"
              onClick={() => {
                console.log(text);
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
                  setInput(text);
                  setUpdateLoading(false);
                  console.log(error);
                }
              }}
              className="flex justify-center items-center rounded-md bg-primary text-white p-[5px_10px]    text-[16px]"
            >
              <span
                className={`absolute ${
                  updateLoading ? "opacity-1" : "opacity-0"
                }`}
              >
                <Spin />
              </span>
              <span className={`${updateLoading ? "opacity-0" : "opacity-1"}`}>
                Submit
              </span>
            </button>
          </div>
        )}
      </AuthorInfo>
    </li>
  );
  function Spin() {
    return (
      //   key={loading ? "true" : "false"}
      //   size={18}
      //   style={{
      //     margin: "0",
      //     display: loading ? "block" : "none",
      //   }}
      //   color={"white"}
      // />
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

export default CommentItem;
