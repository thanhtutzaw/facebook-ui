import useEscape from "@/hooks/useEscape";
import { doc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import {
  JSONTimestampToDate,
  db,
  getCollectionPath,
  getPath,
} from "../../lib/firebase";
import { Comment, Post } from "../../types/interfaces";
import AuthorInfo from "../Post/AuthorInfo";
import Spinner from "../Spinner";
import s from "./index.module.scss";
import { PageContext, PageProps } from "@/context/PageContext";

export default function Comment(props: {
  hasMore: boolean;
  commentEnd?: boolean;
  commentLoading?: boolean;
  uid: string;
  comments: Post["comments"] | [];
  post: Post;
}) {
  const { hasMore, commentEnd, commentLoading, post, comments, uid } = props;
  const { authorId, id: postId } = post;
  const postRef = doc(db, `${getPath("posts", { uid })}/${postId}`);
  const router = useRouter();
  const [client, setclient] = useState(false);
  const [toggleCommentMenu, settoggleCommentMenu] = useState("");
  const [editToggle, seteditToggle] = useState("");
  useEffect(() => {
    setclient(true);
  }, []);
  if (comments?.length === 0) return <></>;
  return (
    <>
      <ul className={s.container}>
        {comments?.map((comment) => (
          <Comment
            client={client}
            uid={uid}
            key={comment.id}
            comment={comment}
          />
        ))}
        {/* {!commentLoading && !commentEnd ? null : commentLoading ? (
        ) : (
          <></>
        )} */}
      </ul>
      {/* {!hasMore && !commentEnd && (
        <p
          style={{
            textAlign: "center",
            userSelect: "none",
          }}
        >
          {comments?.length !== 0 && "No more Comment"}
        </p>
      )} */}
      {!hasMore && !commentEnd ? null : hasMore && !commentEnd ? (
        <Spinner />
      ) : (
        <></>
      )}
    </>
  );
  function Comment(props: { client: boolean; uid: string; comment: Comment }) {
    const { client, uid, comment } = props;
    const { text, createdAt, id, authorId } = comment;
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
    }, [id]);
    // const { settoggleCommentMenu } = useContext(PageContext) as PageProps;
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
    return (
      <li className={s.item} id={`comment-${id}`}>
        <AuthorInfo
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
              suppressContentEditableWarning={true}
              ref={inputRef}
              contentEditable={editToggle === id}
              className={`p-3 focus-visible:outline-0 ${s.text}`}
            >
              {text}
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
            <button className={s.replayBtn}>Reply</button>
          </div>
        </AuthorInfo>
      </li>
    );
  }
}
