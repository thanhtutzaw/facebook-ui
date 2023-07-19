import {
  DocumentData,
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db, postToJSON, userToJSON } from "../firebase";
import { Post } from "../../types/interfaces";
import { getUserData } from "../firebaseAdmin";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
export async function fetchPosts(postSnap: QuerySnapshot<DocumentData>) {
  // const posts = await Promise.all(
  //   postSnap.docs.map(async (doc) => {
  //     const post = await postToJSON(doc);
  //     const UserRecord = (await getUserData(post.authorId)) as UserRecord;
  //     const userJSON = userToJSON(UserRecord);
  //     return {
  //       ...post,
  //       author: {
  //         ...userJSON,
  //       },
  //     };
  //   })
  // );
  // return await Promise.all(
  //   posts.map(async (p) => {
  //     if (p.sharePost) {
  //       const postDoc = doc(
  //         db,
  //         `users/${p.sharePost?.author}/posts/${p.sharePost?.id}`
  //       );
  //       const posts = await getDoc(postDoc);
  //       const post = await postToJSON(posts as DocumentSnapshot<DocumentData>);
  //       const UserRecord = await getUserData(post.authorId);
  //       const userJSON = userToJSON(UserRecord);
  //       const sharePost = {
  //         ...post,
  //         author: {
  //           ...userJSON,
  //         },
  //       };
  //       return {
  //         ...p,
  //         sharePost: { ...p.sharePost, post: { ...sharePost } },
  //       };
  //     }
  //     return {
  //       ...p,
  //     };
  //   })
  // );
}
export async function addPost(
  uid: string,
  visibility: string,
  text: string,
  files?: any[],
  sharePost?: { author: string; id: string }
) {
  const Ref = doc(collection(db, `users/${uid}/posts`));
  const data = {
    id: Ref.id,
    text: text,
    // media: files.map((file) => ({ ...file, id: doc().id })),
    media: files,
    sharePost,
    visibility: visibility,
    createdAt: serverTimestamp(),
    updatedAt: "Invalid Date",
  };
  try {
    console.log({ data });
    await setDoc(Ref, data);
  } catch (error: any) {
    alert("Adding Post Failed !" + error.message);
  }
}
export async function updatePost(
  uid: string,
  text: string,
  files: Post["media"],
  id: string,
  myPost: Post,
  visibility: string
) {
  const Ref = doc(db, `users/${uid}/posts/${id}`);
  let data;
  if (myPost.sharePost) {
    data = {
      authorId: myPost.authorId,
      text,
      sharePost: { author: myPost.sharePost?.author, id: myPost.sharePost?.id },
      media: files,
      visibility,
      createdAt: new Timestamp(
        myPost.createdAt.seconds,
        myPost.createdAt.nanoseconds
      ),
      updatedAt: serverTimestamp(),
    };
  } else {
    data = {
      authorId: myPost.authorId,
      text,
      media: files,
      visibility,
      createdAt: new Timestamp(
        myPost.createdAt.seconds,
        myPost.createdAt.nanoseconds
      ),
      updatedAt: serverTimestamp(),
    };
  }
  try {
    console.log({ data });
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
