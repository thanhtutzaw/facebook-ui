import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { app, db } from "../../lib/firebase";

export async function addSavedPost(authorId: string, postId: string) {
  const uid = getAuth(app).currentUser?.uid;
  if (!uid) {
    alert("Auth User Required.");
    return;
  }
  const Ref = doc(collection(db, `users/${uid}/savedPost`));
  const data = {
    id: Ref.id,
    authorId,
    postId,
  };
  try {
    console.log({ data });
    await setDoc(Ref, data, { merge: true });
    // await updateDoc(Ref, { savedPost: data });
  } catch (error: any) {
    alert("Adding Saved Post Failed !" + error.message);
  }
}
