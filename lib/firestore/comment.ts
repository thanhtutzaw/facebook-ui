import {
  DocumentReference,
  DocumentData,
  writeBatch,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";

export async function addComment(
  commentRef: DocumentReference<DocumentData>,
  uid: string,
  text: string,
  postRef: DocumentReference<DocumentData>,
  previousCommentCount: number
) {
  const batch = writeBatch(db);

  batch.set(commentRef, {
    id: commentRef.id,
    authorId: uid,
    text,
    createdAt: serverTimestamp(),
  });
  batch.update(postRef, {
    commentCount: previousCommentCount + 1,
  });
  await batch.commit();
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
