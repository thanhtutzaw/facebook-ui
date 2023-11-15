import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Query,
  Timestamp,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  increment,
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
export async function fetchComments(query: Query, post: Post, uid: string) {
  const commentDoc = await getDocs(query);
  const commentJSON = await Promise.all(
    commentDoc.docs.map(async (doc) => await commentToJSON(doc))
  );
  const comments = await Promise.all(
    commentJSON.map(async (comment) => {
      if (comment && comment.authorId) {
        const author = await getProfileByUID(comment.authorId.toString());
        const heartsRef = collection(
          db,
          `${getCollectionPath.comments({
            authorId: String(post.authorId),
            postId: String(post.id),
          })}/${comment.id}/hearts`
        );
        const heartCount = (await getCountFromServer(heartsRef)).data().count;
        const likedByUserRef = doc(
          db,
          `${getCollectionPath.comments({
            authorId: String(post.authorId),
            postId: String(post.id),
          })}/${comment.id}/hearts/${uid}`
        );
        const isUserLikeThisPost = (await getDoc(likedByUserRef)).exists();
        return { ...comment, author, heartCount, isLiked: isUserLikeThisPost };
      } else {
        return { ...comment, author: null };
      }
    })
  );
  return comments as Comment[];
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
