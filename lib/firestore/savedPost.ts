import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { app, db } from "../../lib/firebase";
import { SavedPost } from "../../types/interfaces";

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
  }
}
export async function unSavePost(newData: SavedPost[]) {
  const uid = getAuth(app).currentUser?.uid;
  if (!uid) {
    alert("Auth User Required.");
    return;
  }
  try {
    await updateDoc(doc(db, `/users/${uid}`), {
      savedPosts: newData,
    });
  } catch (error: any) {
    alert("Unsave Post Failed !" + error.message);
  }
}
