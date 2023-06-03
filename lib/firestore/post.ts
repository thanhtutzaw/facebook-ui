import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Post } from "../../types/interfaces";

export async function addPost(uid: string, text: string, visibility: string) {
  // alert([uid, visibility, text]);
  const Ref = collection(db, `users/${uid}/posts`);
  const data = {
    text: text,
    visibility: visibility,
    createdAt: serverTimestamp(),
    updatedAt: "Invalid Date",
  };
  try {
    await addDoc(Ref, data);
  } catch (error: any) {
    alert("Adding Post Failed !" + error.message);
  }
}
export async function updatePost(
  uid: string,
  text: string,
  id: string,
  myPost: Post
) {
  const Ref = doc(db, `users/${uid}/posts/${id}`);
  const data = {
    ...myPost,
    text: text,
    createdAt: new Timestamp(
      myPost.createdAt.seconds,
      myPost.createdAt.nanoseconds
    ),
    updatedAt: serverTimestamp(),
  };
  try {
    await updateDoc(Ref, data);
  } catch (error: any) {
    alert("Adding Post Failed !" + error.message);
  }
}
export async function deletePost(uid: string, postid: string | number) {
  const Ref = doc(db, `users/${uid}/posts/${postid.toString()}`);
  try {
    await deleteDoc(Ref);
  } catch (error: any) {
    alert("Delete Failed !" + error.message);
  }
}
