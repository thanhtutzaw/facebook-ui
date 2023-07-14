import { getAuth } from "firebase/auth";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { app, db } from "../../lib/firebase";
import { SavedPost } from "../../types/interfaces";

export async function addSavedPost(authorId: string, postId: string) {
  const uid = getAuth(app).currentUser?.uid;
  if (!uid) {
    alert("Auth User Required.");
    return;
  }
  // const Ref = collection(db, `users/${uid}/savedPost/${postId}`);
  // const data = {
  //   // id: Ref.id,
  //   authorId,
  //   postId,
  // };
  const userRef = doc(db, `users/${uid}`);
  const authorRef = doc(db, `users/${authorId}`);
  const postRef = doc(db, `users/${authorId}/posts/${postId}`);

  try {
    const userSnapshot = await getDoc(userRef);
    const authorSnapShot = await getDoc(authorRef);
    const postSnapshot = await getDoc(postRef);
    console.log(postSnapshot?.exists());
    if (!userSnapshot.exists()) {
      alert("User does not exist.");
    } else if (!postSnapshot.exists()) {
      alert("Post does not exist.");
    } else {
      const savedPosts = userSnapshot.data().savedPosts || [];

      // Check if the post is already saved by the user
      const isSaved = savedPosts.some(
        (savedPost: any) => savedPost.postId === postId
      );
      console.log(userSnapshot.data());
      if (isSaved) {
        alert("Post already saved!");
        return;
      }

      // // Add the post to the user's savedPosts array
      await updateDoc(userRef, {
        savedPosts: arrayUnion({ authorId, postId }),
      });

      alert("Post saved successfully!");
    }
    // try {
    //   // console.log({ data });
    //   // console.log({ ...data });
    //   // await updateDoc(Ref, { savedPost: { ...data } });
    //   // await setDoc(Ref, { ...data }, { merge: true });
    //   await addDoc(Ref, { ...data });
    //   // await setDoc(Ref, { ...data }, { merge: true });
    //   // await updateDoc(Ref, { savedPost: data });
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
  // const Ref = collection(db, `users/${uid}/savedPost/${postId}`);
  // const data = {
  //   // id: Ref.id,
  //   authorId,
  //   postId,
  // };
  // const saveRef = doc(db, `users/${uid}/savedPost/${id}`);
  // const postRef = doc(db, `users/${authorId}/posts/${postId}`);

  try {
    await updateDoc(doc(db, `/users/${uid}`), {
      savedPosts: newData,
    });
    // const saveSnapshot = await getDoc(saveRef);
    // const postSnapshot = await getDoc(postRef);
    // console.log(postSnapshot?.exists());
    // if (!saveSnapshot.exists()) {
    // alert("saved post does not exist.");
    // } else {
    // const savedPosts = saveSnapshot.data().savedPosts || [];

    // Check if the post is already saved by the user
    // const isSaved = savedPosts.some((post: any) => post.postId === postId);

    // Add the post to the user's savedPosts array
    // await deleteDoc(saveRef);
    // alert(id);

    // alert("Unsaved successfully!");
    // }
    // try {
    //   // console.log({ data });
    //   // console.log({ ...data });
    //   // await updateDoc(Ref, { savedPost: { ...data } });
    //   // await setDoc(Ref, { ...data }, { merge: true });
    //   await addDoc(Ref, { ...data });
    //   // await setDoc(Ref, { ...data }, { merge: true });
    //   // await updateDoc(Ref, { savedPost: data });
  } catch (error: any) {
    alert("Unsave Post Failed !" + error.message);
  }
}
