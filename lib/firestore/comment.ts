import {
  DocumentData,
  DocumentReference,
  Query,
  collection,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { Comment_LIMIT } from "../../pages/[user]/[post]";
import { Comment, Post } from "../../types/interfaces";
import {
  commentToJSON,
  db,
  getProfileByUID
} from "../firebase";
export async function fetchComments(query:Query) {
  
  const commentDoc = await getDocs(query);
  const commentJSON = await Promise.all(
    commentDoc.docs.map(async (doc) => await commentToJSON(doc))
  );
  const comments = await Promise.all(
    commentJSON.map(async (c) => {
      if (c && c.authorId) {
        const author = await getProfileByUID(c.authorId?.toString());
        return { ...c, author };
      } else {
        return { ...c, author: null };
      }
    })
  );
  return comments as Comment[];
}
export async function addComment(
  commentRef: DocumentReference<DocumentData>,
  uid: string,
  text: string,
  postRef: DocumentReference<DocumentData>,
  previousCommentCount: number
) {
  const batch = writeBatch(db);
  const data = {
    id: commentRef.id,
    authorId: uid,
    text,
    createdAt: serverTimestamp(),
  };
  batch.set(commentRef, data);
  batch.update(postRef, {
    commentCount: previousCommentCount + 1,
  });
  await batch.commit();
  // return commentDateToJSON(data) as Comment;
  console.log(data.createdAt);
  return data;
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
