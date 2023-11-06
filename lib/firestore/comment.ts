import {
  DocumentData,
  DocumentReference,
  Query,
  Timestamp,
  doc,
  getDocs,
  increment,
  serverTimestamp,
  updateDoc,
  writeBatch
} from "firebase/firestore";
import { Comment } from "../../types/interfaces";
import { commentToJSON, db, getProfileByUID } from "../firebase";
export async function fetchComments(query: Query) {
  const commentDoc = await getDocs(query);
  const commentJSON = await Promise.all(
    commentDoc.docs.map(async (doc) => await commentToJSON(doc))
  );
  const comments = await Promise.all(
    commentJSON.map(async (comment) => {
      if (comment && comment.authorId) {
        const author = await getProfileByUID(comment.authorId.toString());
        return { ...comment, author };
      } else {
        return { ...comment, author: null };
      }
    })
  );
  return comments as Comment[];
}
export async function addComment({
  commentRef,
  uid,
  text,
}: {
  commentRef: DocumentReference<DocumentData>;
  uid: string;
  text: string;
}) {
  const batch = writeBatch(db);
  const data = {
    id: commentRef.id,
    authorId: uid,
    text,
    createdAt: serverTimestamp(),
  };
  batch.set(commentRef, data);

  await batch.commit();
  return data;
}
export async function updateComment(target: string, { ...comment }: Comment) {
  const commentRef = doc(db, target);
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
  batch.update(postRef, {
    commentCount: increment(-1),
  });
  await batch.commit();
}
