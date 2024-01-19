import { User } from "firebase/auth";
import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Query,
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { Comment, Post } from "../../types/interfaces";
import {
  commentToJSON,
  db,
  getCollectionPath,
  getProfileByUID,
} from "../firebase";
import { getMessage, sendAppNoti, sendFCM } from "./notifications";
import { checkPhotoURL } from "./profile";
async function fetchUserFirstReply(
  comment: Comment,
  recentReplies: Comment["recentReplies"],
  post: Partial<Post>,
  uid: string
) {
  const userFirstReplyRef = doc(
    db,
    `${getCollectionPath.commentReplies({
      authorId: String(post.authorId),
      postId: String(post.id),
      commentId: String(comment.id),
    })}/${comment.authorFirstReplyId}`
  );
  const userFirstReplyDoc = await getDoc(userFirstReplyRef);
  if (userFirstReplyDoc.exists()) {
    const userFirstReply = await fetchSingleComment(
      userFirstReplyDoc,
      post,
      uid
    );
    if (userFirstReply) {
      recentReplies = [...recentReplies, { ...userFirstReply }];
    }
  }
  return recentReplies;
}
export async function fetchSingleComment(
  commentDoc:
    | DocumentSnapshot<DocumentData>
    | QueryDocumentSnapshot<DocumentData>,
  post: Partial<Post>,
  uid: string
) {
  if (commentDoc.exists()) {
    const comment = await commentToJSON(commentDoc);
    if (comment && comment.authorId) {
      let recentReplies: Comment["recentReplies"] = [];
      const commentAuthor = await getProfileByUID(String(comment.authorId));
      const recipientProfilePromise = getProfileByUID(
        String(comment.recipient?.id)
      );
      const heartsRef = collection(
        db,
        `${getCollectionPath.comments({
          authorId: String(post.authorId),
          postId: String(post.id),
        })}/${comment.id}/hearts`
      );
      const replyRef = collection(
        db,
        getCollectionPath.commentReplies({
          authorId: String(post.authorId),
          postId: String(post.id),
          commentId: String(comment.id),
        })
      );
      const likedByUserRef = doc(
        db,
        `${getCollectionPath.comments({
          authorId: String(post.authorId),
          postId: String(post.id),
        })}/${comment.id}/hearts/${uid}`
      );
      const firstReplyPromise = fetchUserFirstReply(
        comment,
        recentReplies,
        post,
        uid
      );
      const isLikedPromise = getDoc(likedByUserRef);
      const replyCountPromise = getCountFromServer(replyRef);
      const heartCountPromise = getCountFromServer(heartsRef);
      const [
        profileDoc,
        firstReplyDoc,
        isLikedDoc,
        replyCountDoc,
        heartCountDoc,
      ] = await Promise.all([
        recipientProfilePromise,
        firstReplyPromise,
        isLikedPromise,
        replyCountPromise,
        heartCountPromise,
      ]);
      const recipient = {
        ...comment.recipient,
        author: comment.recipient?.id ? profileDoc : null,
      } as Comment["recipient"];
      if (comment.authorFirstReplyId) {
        recentReplies = [...firstReplyDoc, ...(comment.recentReplies ?? [])];
      }
      const heartCount = heartCountDoc.data().count;
      const replyCount = replyCountDoc.data().count;
      const isLiked = isLikedDoc.exists();
      const updatedComment = {
        ...comment,
        author: commentAuthor,
        heartCount,
        replyCount,
        isLiked: isLiked,
      };
      if (comment.recipient) {
        updatedComment.recipient = recipient;
      }
      if (recentReplies && comment.authorFirstReplyId) {
        updatedComment.recentReplies = recentReplies;
        updatedComment.replyCount--;
      }
      return updatedComment;
    } else {
      return { ...comment, author: null };
    }
  }
}
export async function fetchComments(
  post: Partial<Post>,
  uid: string,
  query: Query
) {
  const commentDoc = await getDocs(query);
  return (await Promise.all(
    commentDoc.docs.map(async (doc) => await fetchSingleComment(doc, post, uid))
  )) as Comment[];
}
export async function loveComment({
  postId,
  commentId,
  authorId,
  uid,
  profile,
  commentAuthorId,
  content,
  parentId,
}: {
  content: string;
  commentAuthorId: string | number;
  postId: string | number;
  commentId: string | number;
  authorId: string | number;
  parentId?: string;
  uid: string;
  profile:
    | (User & { photoURL_cropped?: string | undefined })
    | null
    | undefined;
}) {
  const heartRef = doc(
    db,
    `${getCollectionPath.comments({
      authorId: String(authorId),
      postId: String(postId),
    })}/${commentId}/hearts/${uid}`
  );
  const batch = writeBatch(db);
  batch.set(heartRef, { uid, createdAt: serverTimestamp() });
  await batch.commit();

  const replyURL = `${authorId}/${postId}?comment=${parentId}#reply-${commentId}`;
  // if (uid === authorId) return;
  await sendAppNoti({
    content: content ? content : "",
    uid,
    receiptId: String(commentAuthorId),
    profile,
    type: "comment_reaction",
    url: parentId ? replyURL : `${authorId}/${postId}#comment-${commentId}`,
  });
  const message = `${profile?.displayName ?? "Unknown User"} ${getMessage(
    "comment_reaction"
  )}`;
  await sendFCM({
    recieptId: String(commentAuthorId),
    message,
    actionPayload: {
      content,
      uid,
      receiptId: String(commentAuthorId),
      profile,
      url: parentId ? replyURL : `${authorId}/${postId}#comment-${commentId}`,
    },
    icon: checkPhotoURL(profile?.photoURL_cropped ?? profile?.photoURL),
    tag: `Heart-${commentId}`,
    link: parentId ? replyURL : `/${authorId}/${postId}#comment-${commentId}`,
  });
  return { message };
}
export async function unLoveComment({
  heartRef,
}: {
  heartRef: DocumentReference<DocumentData>;
}) {
  const batch = writeBatch(db);
  batch.delete(heartRef);
  await batch.commit();
}
export async function addComment({
  commentRef,
  authorId,
  text,
  recipient = {
    id: "",
  },
}: {
  commentRef: DocumentReference<DocumentData>;
  authorId: string;
  text: string;
  recipient?: {
    id: string;
  };
}) {
  const batch = writeBatch(db);
  let commentData = {
    id: commentRef.id,
    authorId,
    text,
    createdAt: serverTimestamp(),
  };
  const withRecipient = {
    ...commentData,
    recipient,
  };
  // console.log({ addingReply: commentData });
  batch.set(
    commentRef,
    recipient && recipient.id !== "" ? withRecipient : commentData
  );
  await batch.commit();
}
export async function updateComment(
  commentRef: DocumentReference<DocumentData>,
  { ...comment }: Comment
) {
  const data = { ...comment };
  const { author, ...rest } = data;
  const newComment = {
    ...rest,
    createdAt: new Timestamp(
      comment.createdAt.seconds,
      comment.createdAt.nanoseconds
    ),
    updatedAt: serverTimestamp(),
  };
  try {
    await updateDoc(commentRef, newComment);
  } catch (error) {
    throw error;
  }
}
export async function deleteComment(
  commentRef: DocumentReference<DocumentData>
) {
  const batch = writeBatch(db);
  console.log("delete comment path- " + commentRef.path);
  batch.delete(commentRef);
  await batch.commit();
}
