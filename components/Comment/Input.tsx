import { PageContext, PageProps } from "@/context/PageContext";
import { NotiAction } from "@/lib/NotiAction";
import { checkPhotoURL } from "@/lib/firestore/profile";
import { CommentProps } from "@/pages/[user]/[post]";
import { faArrowAltCircleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from "firebase/auth";
import { collection, doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { useContext, useState } from "react";
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
  const currentUserProfile = {
    displayName: currentUser?.displayName,
    photoURL: profile?.photoURL,
    photoURL_cropped: profile?.photoURL_cropped,
  } as
    | (Partial<User> & {
        photoURL_cropped?: string | undefined;
      })
    | null;
  if (!post) return null;
  const postId = String(post.id);
  const authorId = String(post.authorId);
  const commentRef = doc(getPath("comments", { authorId, postId }));

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
    const addedCommentDoc = await getDoc(commentRef);
    const data = { ...addedCommentDoc.data() } as Comment;
    data["author"] = { ...profile } as Comment["author"];
    setComments?.([data, ...(comments ?? [])]);
    await sendAppNoti({
      messageBody: text,
      uid,
      receiptId: post?.authorId.toString()!,
      profile: currentUserProfile,
      type: "commented_on_post",
      url: `${authorId}/${post?.id}/#comment-${commentRef.id}`,
      content: post.text,
    });
    await sendFCM({
      image: post.media?.[0] ? post.media?.[0].url : undefined,
      recieptId: post?.authorId.toString()!,
      message: `${
        currentUserProfile?.displayName ?? "Unknown User"
      } ${getMessage("commented_on_post")}: "${text}" `,
      icon: checkPhotoURL(
        currentUserProfile?.photoURL_cropped ?? currentUserProfile?.photoURL
      ),
      actionPayload: JSON.stringify({
        text,
        content: text,
        postId,
        commentId: data.id,
        authorId,
        uid,
        commentAuthorId: data.authorId,
        profile: currentUserProfile,
        currentUserProfile,
        replyInput: { ...replyInput, comment: data },
      }),

      actions: [NotiAction.comment_like, NotiAction.comment_reply],
      // collapse_key: `post-${post.id}`,
      tag: `CommentAuthor-${uid}-post-${post.id}-comment`,
      link: `/${authorId}/${post?.id}/#comment-${commentRef.id}`,
    });
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
            await handleReply({
              postId,
              text,
              uid,
              profile,
              replyInput,
              authorId,
              currentUserProfile,
              setComments,
            });
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
export async function handleReply({
  commentId,
  text,
  uid,
  postId,
  authorId,
  replyInput,
  profile,
  setComments,
  currentUserProfile,
  commentAuthorId,
}: {
  text: string;
  uid: string | undefined;
  replyInput: {
    comment: Comment | null;
    authorFirstReplyId: string;
    text: string;
    id: string;
    authorId: string;
    authorName: string;
    parentId: string;
    nested: boolean;
    ViewmoreToggle: boolean;
  };
  currentUserProfile: any;
  profile: any;
  setComments?: Function;
  authorId: string;
  postId: string;
  commentAuthorId?: string;
  commentId?: string;
}) {
  if (!uid) {
    alert("User not Found ! Sign in and Try again !");
    throw Error;
  }
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
  const replyRef =
    replyInput.id && !commentId
      ? doc(
          collection(
            db,
            `${getCollectionPath.comments({ authorId, postId })}/${
              replyInput?.nested ? replyInput?.parentId : replyInput?.id
            }/replies`
          )
        )
      : doc(
          collection(
            db,
            `${getCollectionPath.comments({
              authorId,
              postId,
            })}/${commentId}/replies`
          )
        );
  async function addReplyToReplyToDB() {
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
  async function addreplyToCommentToDB() {
    if (!uid) {
      alert("User not Found ! Sign in and Try again !");
      throw Error;
    }
    console.log("replying comment ...");

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
  if (replyInput && replyInput.nested) {
    await addReplyToReplyToDB();
  } else {
    await addreplyToCommentToDB();
  }
  const getAddedReply = await getDoc(replyRef);
  const data = { ...{ ...getAddedReply.data() } } as Comment;
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

  await sendAppNoti({
    messageBody: text,
    uid,
    receiptId: String(replyInput.comment?.authorId) ?? commentAuthorId,
    profile: currentUserProfile,
    type: "replied_to_comment",
    url: `${authorId}/${postId}?comment=${
      replyInput.comment?.id ?? replyInput.id
    }#reply-${replyRef.id}`,
    content: replyInput.comment?.text ?? replyInput.text,
  });
  await sendFCM({
    recieptId: String(replyInput.comment?.authorId) ?? commentAuthorId,
    message: `${currentUserProfile?.displayName ?? "Unknown User"} ${getMessage(
      "replied_to_comment"
    )}: "${text}" `,
    icon: checkPhotoURL(
      currentUserProfile?.photoURL_cropped ?? currentUserProfile?.photoURL
    ),
    actionPayload: JSON.stringify({
      text,
      parentId: replyInput.comment?.id ?? replyInput.id,
      postId,
      authorId,
      uid,
      commentAuthorId: data.authorId,
      replyInput,
      commentId: data.id,
      // replyInput.comment?.id ?? replyInput.id
      // replyId: replyRef.id,
      currentUserProfile,
    }),
    actions: [NotiAction.comment_like, NotiAction.comment_reply],
    tag: `ReplyAuthor-${uid}-post-${postId}-comment-${
      replyInput.comment?.id ?? replyInput.id
    }-CommentReply`,
    link: `/${authorId}/${postId}?comment=${
      replyInput.comment?.id ?? replyInput.id
    }#reply-${replyRef.id}`,
  });
}
