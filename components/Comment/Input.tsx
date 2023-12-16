import { checkPhotoURL } from "@/lib/firestore/profile";
import { CommentProps } from "@/pages/[user]/[post]";
import { faArrowAltCircleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  DocumentData,
  DocumentReference,
  collection,
  doc,
  getDoc,
} from "firebase/firestore";
import Image from "next/image";
import { useContext, useState } from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import { db, getCollectionPath, getPath } from "../../lib/firebase";
import { addComment, updateComment } from "../../lib/firestore/comment";
import {
  getMessage,
  sendAppNoti,
  sendFCM,
} from "../../lib/firestore/notifications";
import { Comment } from "../../types/interfaces";
import Spinner from "../Spinner";
import s from "./index.module.scss";
type UnwrapArray<T> = T extends (infer U)[] ? U : T;
export default function CommentInput(props: Partial<CommentProps>) {
  const {
    comments,
    setComments,
    post,
    uid,
    profile,
    replyInput,
    replyInputRef,
  } = props;
  const { currentUser } = useContext(PageContext) as PageProps;

  const [text, settext] = useState("");
  const [addLoading, setaddLoading] = useState(false);
  if (!post) return null;
  const postId = String(post.id);
  const authorId = String(post.authorId);
  const commentRef = doc(getPath("comments", { authorId, postId }));
  const updateRecentReplies = (
    newData: UnwrapArray<Comment["recentReplies"]>
  ) => {
    console.log("update recent replies");
    setComments?.(
      (prev: Comment[]) =>
        prev?.map((c) => {
          if (c.id === replyInput?.id) {
            return {
              ...c,
              recentReplies: [...(c.recentReplies ?? []), { ...newData }],
            };
          }
          return { ...c };
        })
    );
  };
  const updateReplies = (newData: UnwrapArray<Comment["replies"]>) => {
    console.log("update replies");
    setComments?.(
      (prev: Comment[]) =>
        prev?.map((c) => {
          if (c.id === replyInput?.parentId) {
            return {
              ...c,
              replyCount: c.replyCount ? c.replyCount + 1 : 0,
              replies: [...(c.replies ?? []), { ...newData }],
            };
          }
          return { ...c };
        })
    );
  };
  async function handleComment() {
    if (!post) return;
    if (!uid) {
      alert("User not Found ! Sign in and Try again !");
      throw Error;
    }
    await addComment({
      commentRef,
      authorId: uid,
      text,
    });
    const doc = await getDoc(commentRef);
    const data = { ...doc.data() } as Comment;
    data["author"] = { ...profile } as Comment["author"];
    setComments?.([data, ...(comments ?? [])]);
    await sendAppNoti({
      messageBody: text,
      uid,
      receiptId: post?.authorId.toString()!,
      profile: currentUser!,
      type: "commented_on_post",
      url: `${authorId}/${post?.id}/#comment-${commentRef.id}`,
      content: post.text,
    });
    await sendFCM({
      recieptId: post?.authorId.toString()!,
      message: `${currentUser?.displayName ?? "Unknown User"} ${getMessage(
        "commented_on_post"
      )}: "${text}" `,
      icon: checkPhotoURL(
        currentUser?.photoURL_cropped ?? currentUser?.photoURL
      ),
      // collapse_key: `post-${post.id}`,
      tag: `CommentAuthor-${uid}-post-${post.id}-comment`,
      link: `/${authorId}/${post?.id}/#comment-${commentRef.id}`,
    });
  }
  async function handleReply() {
    if (!post) return;
    if (!uid) {
      alert("User not Found ! Sign in and Try again !");
      throw Error;
    }
    console.log("replying comment ...");
    const replyRef = doc(
      collection(
        db,
        `${getCollectionPath.comments({ authorId, postId })}/${
          replyInput?.nested ? replyInput?.parentId : replyInput?.id
        }/replies`
      )
    );

    if (replyInput && replyInput.nested) {
      await replyToReply(replyRef);
    } else {
      await replyToComment(replyRef);
    }
    const repliedDoc = await getDoc(replyRef);
    const data = { ...{ ...repliedDoc.data() } } as Comment;
    data["author"] = { ...profile } as Comment["author"];
    if (replyInput) {
      replyInput.ViewmoreToggle
        ? !replyInput.nested && updateRecentReplies(data)
        : replyInput.nested
        ? updateReplies({
            ...data,
            recipient: {
              id: replyInput.authorId,
              author: {
                fullName: String(replyInput.authorName) ?? "",
              },
            },
          })
        : updateRecentReplies(data);
    }
    if (!replyInput) return;
    await sendAppNoti({
      messageBody: text,
      uid,
      receiptId: replyInput.authorId,
      profile: currentUser!,
      type: "replied_to_comment",
      url: `${authorId}/${post.id}?comment=${replyInput.id}#reply-${replyRef.id}`,
      content: replyInput.text,
    });
    await sendFCM({
      recieptId: replyInput.authorId,
      message: `${currentUser?.displayName ?? "Unknown User"} ${getMessage(
        "replied_to_comment"
      )}: "${text}" `,
      icon: checkPhotoURL(
        currentUser?.photoURL_cropped ?? currentUser?.photoURL
      ),
      tag: `ReplyAuthor-${uid}-post-${post.id}-comment-${replyInput.id}-CommentReply`,
      link: `/${authorId}/${post.id}?comment=${replyInput.id}#reply-${replyRef.id}`,
    });
  }
  async function replyToReply(replyRef: DocumentReference<DocumentData>) {
    if (!uid) {
      alert("User not Found ! Sign in and Try again !");
      throw Error;
    }
    if (!replyInput) return;
    const recipient = {
      id: replyInput.authorId,
    };
    await addComment({
      commentRef: replyRef,
      recipient,
      authorId: uid,
      text,
    });
  }
  async function replyToComment(replyRef: DocumentReference<DocumentData>) {
    if (!uid) {
      alert("User not Found ! Sign in and Try again !");
      throw Error;
    }
    await addComment({
      commentRef: replyRef,
      authorId: uid,
      text,
    });
    const isAuthorFirstReplyIdExists =
      replyInput?.comment && replyInput?.comment.authorFirstReplyId;
    const isAuthorReplyingFirstTime =
      !isAuthorFirstReplyIdExists && replyInput?.authorId === uid;
    if (isAuthorReplyingFirstTime) {
      const commentRef = doc(
        db,
        `${getCollectionPath.comments({
          authorId: authorId,
          postId: postId,
        })}/${replyInput.id}`
      );
      const oldComment = replyInput.comment as Comment;
      if (!oldComment) return;
      await updateComment(commentRef, {
        ...oldComment,
        authorFirstReplyId: replyRef.id,
      });
      setComments?.(
        (prev: Comment[]) =>
          prev?.map((c) => {
            console.log({ comment: c.id, replyInput: replyInput.id });
            if (c.id === replyInput?.id) {
              return {
                ...c,
                authorFirstReplyId: replyRef.id,
              };
            }
            return { ...c };
          })
      );
    }
  }
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!uid) {
          alert("User not Found ! Sign in and Try again !");
          throw Error;
        }
        if (text === "") return;

        try {
          setaddLoading(true);
          const isReplyingComment = replyInput?.authorName;
          if (isReplyingComment) {
            await handleReply();
          } else {
            await handleComment();
          }
          settext("");
          setaddLoading(false);
        } catch (error: unknown) {
          console.log(error);
          alert(error);
        } finally {
          props.setreplyInput?.({
            id: "",
            text: "",
            authorId: "",
            authorName: "",
            authorFirstReplyId: "",
            comment: null,
          });
          setaddLoading(false);
        }
      }}
      className={s.input}
    >
      <Image
        className={`rounded-full object-cover b-0 w-[45px] h-[45px] flex outline-[1px solid rgba(128,128,128,0.168627451)] bg-avatarBg`}
        width={200}
        height={200}
        loading="eager"
        priority={false}
        alt={currentUser?.displayName ?? "Unknow User"}
        src={checkPhotoURL(
          profile ? (profile?.photoURL as string) : currentUser?.photoURL
        )}
      />
      <input
        ref={replyInputRef}
        onChange={(e) => {
          settext(e.target.value);
        }}
        value={text}
        aria-label="Add Comment"
        placeholder={
          replyInput && replyInput.authorName
            ? `Replying to ${replyInput.authorName}`
            : "Add Comment"
        }
        type="text"
        disabled={addLoading || !uid}
      />
      <button
        aria-label={`${addLoading ? "Submiting Comment" : "Submit Comment"}`}
        tabIndex={1}
        type="submit"
        disabled={addLoading}
      >
        {addLoading ? (
          <Spinner style={{ margin: 0 }} />
        ) : (
          <FontAwesomeIcon icon={faArrowAltCircleUp} />
        )}
      </button>
    </form>
  );
}
