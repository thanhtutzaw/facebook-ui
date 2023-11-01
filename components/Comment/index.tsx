import { doc } from "firebase/firestore";
import { useRouter } from "next/router";
import { LegacyRef, useEffect, useLayoutEffect, useRef, useState } from "react";
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
import useEscape from "@/hooks/useEscape";

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
    const [editToggle, seteditToggle] = useState("");
    useLayoutEffect(() => {
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
      }
    });
    function handleEditComment() {
      if (editToggle !== "") {
        seteditToggle("");
      } else {
        seteditToggle(String(id));
      }
    }
    return (
      <li className={s.item} id={`comment-${id}`}>
        <AuthorInfo
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
              editToggle === id ? "outline outline-1 outline-gray " : ""
            } max-h-20 overflow-scroll 
            `}
          >
            <p
              // key={editToggle === id ? 'true':'false'}
              suppressContentEditableWarning={true}
              ref={inputRef}
              contentEditable={editToggle === id}
              className={`${
                editToggle !== id ? "cursor-default" : "cursor-text"
              } p-3 focus-visible:outline-0 ${s.text}`}
            >
              {text}
              <br />
              {editToggle}
              <br />
              {id}
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
