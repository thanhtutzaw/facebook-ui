import useComment from "@/hooks/useComment";
import { JSONTimestampToDate, db, getCollectionPath } from "@/lib/firebase";
import { getFullName } from "@/lib/firestore/profile";
import { CommentProps } from "@/pages/[user]/[post]";
import { Comment as CommentType, Post, account } from "@/types/interfaces";
import { faAngleDown, faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { doc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { RefObject, memo, useCallback, useMemo, useState } from "react";
import Comment from ".";
import AuthorInfo from "../AuthorInfo";
import Spinner from "../Spinner";
import CommentAction from "./Action";
import s from "./index.module.scss";
export interface CommentItemProps extends CommentProps {
  menuRef?: RefObject<HTMLDivElement>;
  toggleCommentMenu?: string;
  settoggleCommentMenu?: Function;
  editToggle?: string;
  seteditToggle?: Function;
  nested?: boolean;
  client?: boolean;
  comment: CommentType;
  preview?: boolean;
  isDropDownOpenInNestedComment?: boolean;
  setisDropDownOpenInNestedComment?: Function;
}
function CommentItem(props: CommentItemProps & { post: Post }) {
  const {
    replyInputRef,
    replyInput,
    setreplyInput,
    setisDropDownOpenInNestedComment,
    isDropDownOpenInNestedComment,
    parentId,
    nested,
    setComments,
    menuRef,
    toggleCommentMenu,
    settoggleCommentMenu,
    post,
    editToggle,
    client,
    uid,
    comment,
  } = props;
  const {
    ViewmoreToggle,
    inputRef,
    replyLoading,
    input,
    handleEditComment,
    heartLoading,
    handleLike,
    isLiked,
    heartCount,
    updateLoading,
    handleUpdateComment,
    cancelUpdate,
    handleHide,
    handleViewMore,
    handleReplyInput,
    replyCount,
    replies,
  } = useComment(props);
  const router = useRouter();

  const { text, createdAt, id } = comment;
  const { authorId, id: postId } = post;
  const postRef = useMemo(
    () => doc(db, `${getCollectionPath.posts({ uid })}/${postId}`),
    [postId, uid]
  );
  const commentRef = useMemo(
    () =>
      parentId
        ? doc(
            db,
            `${getCollectionPath.commentReplies({
              authorId: String(post.authorId),
              postId: String(post.id),
              commentId: String(parentId),
            })}/${comment.id}`
          )
        : doc(
            db,
            `${getCollectionPath.comments({
              authorId: String(post.authorId),
              postId: String(post.id),
            })}/${comment.id}`
          ),
    [comment.id, parentId, post.authorId, post.id]
  );
  const replyCountText =
    !replies || !ViewmoreToggle ? replyCount : replyCount - replies.length;
  const more =
    replies.length && ViewmoreToggle
      ? "more"
      : replyCount > 1
      ? "replies"
      : "reply";
  const navigateCommentAuthor = useCallback(() => {
    router.push(`/${String(comment?.authorId)}`);
  }, [comment?.authorId, router]);
  const recipientAuthorName = comment?.recipient?.author?.fullName
    ? comment.recipient.author.fullName
    : getFullName(comment?.recipient?.author as account["profile"]);
  const isRecipientComment =
    recipientAuthorName && comment?.recipient && comment.recipient.id;
  const textEnd = isRecipientComment && (
    <>
      <span
        style={{ marginLeft: "1rem" }}
        className="w-0 h-0 inline-block border-solid border-8 border-r-transparent border-b-transparent border-t-transparent rounded-sm border-bottom-transparent border-l-gray ml-[1rem] "
      ></span>

      <span
        style={{
          color: comment ? "rgb(46 46 46)" : "initial",
          //  fontSize: !children ? "18px" : "inherit",
          //  fontWeight: children ? "500" : "initial",
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!comment.recipient) return;
          if (router.pathname === "/") {
            router.push(
              { query: { user: String(comment.recipient.id) } },
              String(comment.recipient.id)
            );
          } else {
            router.push(`/${String(comment.recipient.id)}`);
          }
        }}
      >
        {recipientAuthorName}
      </span>
    </>
  );
  const isAdmin = uid === comment.authorId;
  const { author } = comment;
  const profile = author as account["profile"];
  const hightlightStyleByURL = nested
    ? router.query && router.asPath.match(String(id))
      ? "#e9f3ff"
      : "initial"
    : client && !router.query.comment && router.asPath.match(String(id))
    ? "#e9f3ff"
    : "initial";
  // function toggleScrollPadding(isTrue?: boolean) {
  //   // const element = document.getElementsByTagName("main")[0];
  //   // if (isTrue) {
  //   //   element && (element.style.scrollPadding = "65px");
  //   // } else {
  //   //   element && (element.style.scrollPadding = "initial");
  //   // }
  // }

  const [storedScroll, setStoredScroll] = useState(0);
  return (
    <li
      className={`${nested ? "!pl-[calc(45px+8px)]" : ""} ${s.item}`}
      id={nested ? `reply-${id}` : `comment-${id}`}
      onClick={(e) => {
        if (!props.preview) return;

        if (toggleCommentMenu === "") {
          router.push({
            pathname: `/${post.authorId}/${post.id}`,
            hash: `comment-${comment.id}`,
          });
        }
      }}
    >
      <AuthorInfo
        style={{
          transition: "background .3s ease-in-out",
          background: hightlightStyleByURL,
          borderRadius: "0.5rem 0 0 0.5rem",
        }}
      >
        <AuthorInfo.User
          style={{ userSelect: "initial", alignItems: "initial" }}
          size={nested ? 25 : 45}
          navigateToProfile={navigateCommentAuthor}
          profile={profile}
        >
          <AuthorInfo.UserName
            comment={true}
            hasChildren={true}
            profile={profile}
            textEnd={textEnd}
            navigateToProfile={navigateCommentAuthor}
          />
          {input !== "" && input && (
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
          )}
          <div className={s.actions}>
            {createdAt && (
              <p suppressHydrationWarning>
                {JSONTimestampToDate(createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
            {!props.preview && (
              <>
                <button
                  disabled={heartLoading}
                  style={{
                    pointerEvents: heartLoading ? "none" : "initial",
                  }}
                  onClick={async () => await handleLike()}
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
                <button className={s.replyBtn} onClick={handleReplyInput}>
                  Reply
                </button>
              </>
            )}
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
                    onClick={cancelUpdate}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={updateLoading}
                    onClick={async () => await handleUpdateComment()}
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
        </AuthorInfo.User>
        {!props.preview && (
          <CommentAction
            parentId={parentId ?? ""}
            nested={nested ?? false}
            setisDropDownOpenInNestedComment={setisDropDownOpenInNestedComment!}
            isAdmin={isAdmin ?? false}
            setComments={setComments!}
            menuRef={menuRef!}
            toggleCommentMenu={toggleCommentMenu!}
            settoggleCommentMenu={settoggleCommentMenu!}
            comment={comment}
            handleEditComment={handleEditComment!}
            postRef={postRef!}
            commentRef={commentRef!}
          />
        )}
      </AuthorInfo>
      {/* &&
        !comment.recentReplies?.some((recent) => recent.id != comment.id) */}
      {/* {true &&
         <>
          {comment.id} contains in 
        {JSON.stringify(
          // !comment.recentReplies?.some((recent) => recent.id !== comment.id)
          comment.recentReplies?.map((r) => r.id)
          )}
         </>
          
          } */}
      {/* commentNotFoundLoading */}

      {comment.recentRepliesLoading && !nested && (
        <span
          id="recentRepliesLoading"
          className="!p-0 h-[24px] flex justify-center items-center text-[16px] gap-2"
        >
          <Spinner style={{ margin: "0" }} size={16} />
        </span>
      )}

      {comment.recentReplies && !props.preview && (
        <Comment
          parentId={String(comment.id)}
          nested={true}
          comments={comment.recentReplies}
          setComments={setComments}
        >
          {comment.recentReplies.map((recent) => (
            <CommentItem
              preview={props.preview}
              replyInputRef={replyInputRef}
              replyInput={replyInput}
              setreplyInput={setreplyInput}
              setisDropDownOpenInNestedComment={
                setisDropDownOpenInNestedComment!
              }
              isDropDownOpenInNestedComment={isDropDownOpenInNestedComment}
              post={post}
              client={client}
              uid={uid}
              key={String(recent.id)}
              parentId={String(comment.id)}
              nested={true}
              comment={recent}
              comments={comment.recentReplies}
              setComments={setComments}
            />
          ))}
        </Comment>
      )}
      <div
        style={{
          padding: "0 !important",
          gridTemplateRows:
            ViewmoreToggle && replies.length > 0 ? "1fr" : "0fr",
        }}
        className={` grid transition-all duration-300 ease-in-out ${s.replyContainer}`}
      >
        <AnimatePresence>
          {replies && post && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`${
                isDropDownOpenInNestedComment &&
                toggleCommentMenu !== comment.id &&
                ViewmoreToggle
                  ? ""
                  : "overflow-hidden"
              } `}
            >
              <Comment
                parentId={String(comment.id)}
                nested={true}
                comments={replies}
                setComments={setComments}
              >
                {replies?.map((comment) => (
                  <CommentItem
                    replyInputRef={replyInputRef}
                    replyInput={replyInput}
                    setreplyInput={setreplyInput}
                    setisDropDownOpenInNestedComment={
                      setisDropDownOpenInNestedComment
                    }
                    isDropDownOpenInNestedComment={
                      isDropDownOpenInNestedComment
                    }
                    post={post}
                    client={client}
                    uid={uid}
                    key={String(comment.id)}
                    parentId={String(comment.id)}
                    nested={true}
                    comment={comment}
                    setComments={setComments}
                  />
                ))}
              </Comment>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {!nested && replyCount > 0 && (
        <>
          {replyLoading ? (
            <span className="h-[24px] flex justify-center items-center text-[16px] gap-2">
              <Spinner
                style={{
                  margin: "0",
                }}
                size={16}
              />
            </span>
          ) : (
            <div className="flex justify-between">
              <button
                className={`${
                  replies.length !== replyCount || !ViewmoreToggle
                    ? ""
                    : "hidden"
                } ml-[calc(45px+8px)] flex  items-center gap-1 bg-transparent text-[16px] text-gray ${
                  !ViewmoreToggle ? "hover:opacity-80 active:opacity-50" : ""
                } ${s.replyBtn}`}
                onClick={async () => {
                  const main =
                    document.getElementsByTagName("main")[0].scrollTop;
                  setStoredScroll(main);
                  await handleViewMore();
                }}
              >
                {`View ${replyCountText} ${more}`}
                {/* {replyCount} , {replies?.length} , {comment.replyCount} */}
                <FontAwesomeIcon color="#808080" icon={faAngleDown} />
              </button>
              {ViewmoreToggle && (
                <button
                  onClick={() => {
                    const element = document.getElementsByTagName("main")[0];
                    element?.scrollTo({ top: storedScroll });
                    handleHide();
                  }}
                  className={`ml-auto flex items-center gap-1 bg-transparent text-[16px] text-gray ${
                    replies.length ? "opacity-100" : "opacity-0"
                  } ${
                    ViewmoreToggle ? "hover:opacity-80 active:opacity-50" : ""
                  } ${s.replyBtn}`}
                >
                  Hide
                </button>
              )}
            </div>
          )}
        </>
      )}
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
export default memo(CommentItem);
