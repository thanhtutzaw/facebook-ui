import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { Post } from "../../types/interfaces";

export async function addPost(
  uid: string,
  files: any[],
  text: string,
  visibility: string
) {
  // alert([uid, visibility, text]);
  const Ref = collection(db, `users/${uid}/posts`);
  const data = {
    text: text,
    // media: files.map((file) => ({ ...file, id: doc().id })),
    media: files,
    visibility: visibility,
    createdAt: serverTimestamp(),
    updatedAt: "Invalid Date",
  };
  try {
    console.log(data);
    await addDoc(Ref, data);
    // console.log(data.media);
    // data.media.map((m) => {
    //   console.log(m.url);
    // });
  } catch (error: any) {
    alert("Adding Post Failed !" + error.message);
  }
}
export async function updatePost(
  uid: string,
  text: string,
  id: string,
  myPost: Post,
  visibility: string
) {
  const Ref = doc(db, `users/${uid}/posts/${id}`);
  const data = {
    ...myPost,
    text: text,
    visibility: visibility,
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
export async function deleteMultiple(uid: string, selctedId: string[]) {
  const chunkSize = 10;
  const batch = writeBatch(db);
  for (let i = 0; i < selctedId.length; i += chunkSize) {
    const chunk = selctedId.slice(i, i + chunkSize);
    for (let j = 0; j < chunk.length; j++) {
      const docRef = doc(db, `users/${uid}/posts/${chunk[j]}`);
      batch.delete(docRef);
    }
  }
  try {
    await batch.commit();
  } catch (error: any) {
    alert("Delete Failed !" + error.message);
  }
}
