import { CommentItemProps } from "@/components/Comment/CommentItem";
import { usePageContext } from "@/context/PageContext";
import { Comment_Reply_LIMIT } from "@/lib/QUERY_LIMIT";
import { app, db, getCollectionPath, getPath } from "@/lib/firebase";
import {
  fetchComments,
  loveComment,
  unLoveComment,
  updateComment,
} from "@/lib/firestore/comment";
import { getFullName } from "@/lib/firestore/profile";
import { Comment, account } from "@/types/interfaces";
import { getAuth } from "firebase/auth";
import {
  Timestamp,
  collection,
  doc,
  getCountFromServer,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEscape from "./useEscape";

function useComment(props: CommentItemProps) {
  const {
    replyInputRef,
    replyInput,
    setreplyInput,
    parentId,
    nested,
    comments,
    setComments,
    settoggleCommentMenu,
    post,
    editToggle,
    seteditToggle,
    uid,
    comment,
  } = props;
  const inputRef = useRef<HTMLParagraphElement>(null);
  const { text, createdAt, id } = comment;
  const { authorId, id: postId } = post!;
  const { currentUser: profile } = usePageContext();
  const replyCount = comment.replyCount ?? 0;
  const replies = useMemo(() => comment?.replies ?? [], [comment?.replies]);
  const [input, setInput] = useState(text);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [heartLoading, setHeartLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [heartCount, setHeartCount] = useState(comment.heartCount ?? 0);
  const hasMore = comment?.replies?.length < (comment?.replyCount ?? 0);

  const auth = getAuth(app);
  useEffect(() => {
    if (editToggle === id) {
      if (inputRef.current) {
        const contentEle = inputRef.current;
        const range = document.createRange();
        const selection = window.getSelection();
        // console.log(contentEle.childNodes.length);
        range.setStart(contentEle, contentEle.childNodes.length);
        range.collapse(true);
        // if(!selection )return;
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [editToggle, id]);
  const handleEditComment = useCallback(() => {
    if (editToggle !== "") {
      seteditToggle?.("");
    } else {
      seteditToggle?.(String(id));
    }
    setTimeout(() => {
      settoggleCommentMenu?.("");
    }, 300);
  }, [editToggle, id, seteditToggle, settoggleCommentMenu]);
  const heartRef = doc(
    db,
    `${getCollectionPath.comments({
      authorId: String(authorId),
      postId: String(postId),
    })}/${comment.id}/hearts/${auth.currentUser?.uid}`
  );
  const likedUserRef = collection(
    db,
    `${getCollectionPath.comments({
      authorId: String(authorId),
      postId: String(postId),
    })}/${comment.id}/hearts`
  );
  const handleLike = async () => {
    setHeartLoading(true);
    setIsLiked((prev) => !prev);
    if (!auth.currentUser?.uid) {
      alert("Error : User Not Found . Sign up and Try Again ! ");
      return;
    }
    if (isLiked) {
      await unLoveComment({ heartRef });
      await updateHeartState();
    } else {
      await loveComment({
        parentId: nested ? parentId : undefined,
        content: comment.text,
        profile,
        postId: postId!,
        commentId: comment.id!,
        authorId: authorId,
        uid: String(auth.currentUser?.uid),
        commentAuthorId: String(comment.authorId),
      });
      await updateHeartState();
    }

    async function updateHeartState() {
      setHeartLoading(false);
      const updatedLikeCount = (await getCountFromServer(likedUserRef)).data()
        .count;
      setHeartCount?.(updatedLikeCount);
    }
  };
  // if (!seteditToggle || !settoggleCommentMenu)
  //   throw Error("Need EditToggle and toggleCommentMenu");
  useEscape(() => {
    if (editToggle !== "") {
      seteditToggle?.("");
      settoggleCommentMenu?.("");
    }
  });
  const [ViewmoreToggle, setViewmoreToggle] = useState(false);
  const [replyLoading, setreplyLoading] = useState(false);
  useEffect(() => {
    if (comment.recentRepliesLoading) {
      const element = document.getElementById("recentRepliesLoading")
        ?.parentElement;
      element?.scrollIntoView();
    }
  }, [comment.recentRepliesLoading]);

  async function handleUpdateComment() {
    const editedComment = inputRef.current?.innerText;
    const commentRef = parentId
      ? doc(
          db,
          `${getCollectionPath.commentReplies({
            authorId: String(authorId),
            postId: String(postId),
            commentId: String(parentId),
          })}/${comment.id}`
        )
      : doc(
          db,
          `${getCollectionPath.comments({
            authorId: String(authorId),
            postId: String(postId),
          })}/${comment.id}`
        );
    const data = { ...comment, text: editedComment! };
    try {
      setUpdateLoading(true);
      await updateComment(commentRef, data);
      setInput(editedComment ?? input);
      setUpdateLoading(false);
      seteditToggle?.("");
    } catch (error) {
      alert("Failed updating comment ! " + error);
      setInput(text);
      console.log(error);
    } finally {
      setUpdateLoading(false);
    }
  }

  function cancelUpdate() {
    setInput(text);
    seteditToggle?.("");
  }

  const handleHide = useCallback(() => {
    setViewmoreToggle(false);
    setreplyInput?.((prev: typeof replyInput) => ({
      ...prev,
      ViewmoreToggle: false,
    }));
  }, [setreplyInput]);

  const handleViewMore = useCallback(async () => {
    if (!ViewmoreToggle) {
      setViewmoreToggle(true);
      setreplyInput?.((prev: typeof replyInput) => ({
        ...prev,
        ViewmoreToggle: true,
      }));
    }
    let replyCommentQuery = query(
      getPath("commentReplies", {
        authorId: String(authorId),
        postId: String(postId),
        commentId: String(comment.id),
      }),
      orderBy("createdAt", "asc"),
      limit(Comment_Reply_LIMIT)
    );
    const fetchMoreReplies = async () => {
      if (!post) return;
      const newReplies = await fetchComments(post, uid, replyCommentQuery);
      setComments?.(
        (prev: Comment[]) =>
          prev?.map((c) => {
            if (c.id === comment.id) {
              return {
                ...c,
                replies: [
                  ...(c.replies ?? []),
                  ...newReplies.filter(
                    (newReply) =>
                      !comment.recentReplies?.some(
                        (recent) => recent.id === newReply.id
                      )
                  ),
                ],
              };
            }

            return { ...c };
          })
      );
    };
    if (replies.length === replyCount) return;
    if (!ViewmoreToggle && !replies.length) {
      setreplyLoading(true);
      try {
        await fetchMoreReplies();
      } catch (error) {
        console.log(error);
      } finally {
        setreplyLoading(false);
      }
    }
    setreplyLoading(true);
    const lastItem = comment && replies && replies[replies.length - 1];
    const date = lastItem
      ? new Timestamp(
          lastItem.createdAt.seconds,
          lastItem.createdAt.nanoseconds
        )
      : null;
    replyCommentQuery =
      hasMore && ViewmoreToggle
        ? query(
            getPath("commentReplies", {
              authorId: String(authorId),
              postId: String(postId),
              commentId: String(comment.id),
            }),
            orderBy("createdAt", "asc"),
            limit(Comment_Reply_LIMIT),
            startAfter(date) // orderBy("heartCount", "desc")
          )
        : replyCommentQuery;

    try {
      if (ViewmoreToggle) {
        await fetchMoreReplies();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setreplyLoading(false);
    }
  }, [
    ViewmoreToggle,
    authorId,
    comment,
    hasMore,
    post,
    postId,
    replies,
    replyCount,
    setComments,
    setreplyInput,
    uid,
  ]);
  function handleReplyInput() {
    replyInputRef && replyInputRef.current?.focus();
    const commentProfile = comment.author as account["profile"];
    const commentAuthorName = getFullName(commentProfile);
    // if(!comment)
    setreplyInput?.((prev: typeof replyInput) => ({
      ...prev,
      comment: comment,
      authorName: commentAuthorName,
      authorId: comment.authorId,
      text: comment.text,
      id: comment.id,
      nested,
      ViewmoreToggle,
      parentId,
    }));
  }
  return {
    handleEditComment,
    ViewmoreToggle,
    inputRef,
    replyLoading,
    input,

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
  };
}

export default useComment;
