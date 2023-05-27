import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export async function addPost(uid: string, text: string, visibility: string) {
  //   alert([uid, visibility, text]);
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
export async function deletePost(uid: string, postid: string | number) {
  //   alert([uid, visibility, text]);
  const Ref = doc(db, `users/${uid}/posts/${postid.toString()}`);
  // const data = {
  //   text: text,
  //   visibility: visibility,
  //   createdAt: serverTimestamp(),
  //   updatedAt: "Invalid Date",
  // };
  try {
    await deleteDoc(Ref);
  } catch (error: any) {
    alert("Delete Failed !" + error.message);
  }
}
