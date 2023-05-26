import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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
  await addDoc(Ref, data);
}
