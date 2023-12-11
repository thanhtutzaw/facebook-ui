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
export async function fetchSingleComment(
  commentDoc:
    | DocumentSnapshot<DocumentData>
    | QueryDocumentSnapshot<DocumentData>,
  post: Partial<Post>,
  uid: string
) {
  const comment = await commentToJSON(commentDoc);
  if (commentDoc.exists()) {
    if (comment && comment.authorId) {
      const author = await getProfileByUID(String(comment.authorId));
      const recipient = {
        ...comment.recipient,
        author: comment.recipient?.id
          ? await getProfileByUID(String(comment.recipient?.id))
          : null,
      } as Comment["recipient"];
      const heartsRef = collection(
        db,
        `${getCollectionPath.comments({
          authorId: String(post.authorId),
          postId: String(post.id),
        })}/${comment.id}/hearts`
      );

      const heartCount = (await getCountFromServer(heartsRef)).data().count;
      const replyRef = collection(
        db,
        getCollectionPath.commentReplies({
          authorId: String(post.authorId),
          postId: String(post.id),
          commentId: String(comment.id),
        })
      );
      const replyCount = (await getCountFromServer(replyRef)).data().count;
      const likedByUserRef = doc(
        db,
        `${getCollectionPath.comments({
          authorId: String(post.authorId),
          postId: String(post.id),
        })}/${comment.id}/hearts/${uid}`
      );
      const isUserLikeThisPost = (await getDoc(likedByUserRef)).exists();
      // console.log(comment.recipient && comment.recipient.id === "");
      if (comment.recipient) {
        return {
          ...comment,
          author,
          recipient,
          heartCount,
          replyCount,
          isLiked: isUserLikeThisPost,
        };
      }
      return {
        ...comment,
        author,
        heartCount,
        replyCount,
        isLiked: isUserLikeThisPost,
      };
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
  heartRef,
  uid,
}: {
  heartRef: DocumentReference<DocumentData>;
  uid: string;
}) {
  const batch = writeBatch(db);
  batch.set(heartRef, { uid, createdAt: serverTimestamp() });
  await batch.commit();
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
  const commentData = {
    id: commentRef.id,
    authorId,
    text,
    createdAt: serverTimestamp(),
  };
  const withRecipient = {
    ...commentData,
    recipient,
  };
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
  commentRef: DocumentReference<DocumentData>,
  postRef: DocumentReference<DocumentData>
) {
  const batch = writeBatch(db);

  batch.delete(commentRef);
  await batch.commit();
}
