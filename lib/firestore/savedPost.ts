import { DocumentData } from "@google-cloud/firestore";
import { getAuth } from "firebase/auth";
import {
  DocumentReference,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { app, db } from "../../lib/firebase";

export async function addSavedPost(authorId: string, postId: string) {
  const uid = getAuth(app).currentUser?.uid;
  if (!uid) {
    alert("Auth User Required.");
    return;
  }
  const authorRef = doc(db, `users/${authorId}`);
  const postRef = doc(db, `users/${authorId}/posts/${postId}`);
  const Ref = doc(db, `users/${uid}/savedPost/${postId}`);
  const data = {
    authorId,
    postId,
    createdAt: serverTimestamp(),
  };
  try {
    const authorSnapShot = await getDoc(authorRef);
    const postSnapshot = await getDoc(postRef);

    if (!authorSnapShot.exists()) {
      alert("Author does not exist.");
    } else if (!postSnapshot.exists()) {
      alert("Post does not exist.");
    } else {
      await setDoc(Ref, data);
    }
  } catch (error: any) {
    alert("Adding Saved Post Failed !" + error.message);
    throw Error;
  }
}
export async function unSavePost(ref: DocumentReference<DocumentData>) {
  const uid = getAuth(app).currentUser?.uid;
  if (!uid) {
    alert("Auth User Required.");
    return;
  }
  try {
    await deleteDoc(ref);
    // await updateDoc(doc(db, `/users/${uid}`), {
    //   savedPosts: newData,
    // });
  } catch (error: any) {
    alert("Unsave Post Failed !" + error.message);
    throw Error;
  }
}
