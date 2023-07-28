import {
  DocumentData,
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  addDoc,
  arrayUnion,
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
import { selectedId } from "../../context/PageContext";
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
  // originalPost?: Post
) {
  const Ref = doc(collection(db, `users/${uid}/posts`));
  const post = {
    id: Ref.id,
    text: text,
    // media: files.map((file) => ({ ...file, id: doc().id })),
    media: files,
    visibility: visibility,
    createdAt: serverTimestamp(),
    updatedAt: "Invalid Date",
  };
  let data;
  const sharersRef = doc(
    db,
    `users/${sharePost?.author}/posts/${sharePost?.id}/shares/${uid}`
  );
  // const originalPost = await getDoc(targetPostRef);
  if (sharePost) {
    data = {
      ...post,
      sharePost,
    };
    await setDoc(sharersRef, { uid });
    // await updateDoc(targetPostRef, {
    //   ...originalPost.data(),
    //   sharers: arrayUnion(uid),
    // });
  } else {
    data = { ...post };
  }
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
  const post = {
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
  if (myPost.sharePost) {
    data = {
      ...post,
      sharePost: { author: myPost.sharePost?.author, id: myPost.sharePost?.id },
    };
  } else {
    data = {
      ...post,
    };
  }
  try {
    console.log({ data });
    await updateDoc(Ref, data);
  } catch (error: any) {
    alert("Adding Post Failed !" + error.message);
  }
}
export async function deletePost(
  uid: string,
  postid: string | number,
  post: Post
) {
  const Ref = doc(db, `users/${uid}/posts/${postid.toString()}`);
  const exist = (await getDoc(Ref)).exists();
  if (!exist) {
    console.log("Delete Error : Data Not Found");
    throw new Error("Delete Error : Data Not Found");
  }
  if (post.sharePost?.id) {
    const id = post.sharePost.id;
    const shareRef = doc(
      db,
      `users/${post.sharePost.author}/posts/${id}/shares/${uid}`
    );
    // console.log(
    //   "Delete this sharedPost" +  + post.sharePost.post?.id
    // );
    await deleteDoc(shareRef);
  }
  try {
    await deleteDoc(Ref);
  } catch (error: any) {
    console.error(error);
    alert("Delete Failed !" + error.message);
  }
}
export async function deleteMultiple(uid: string, selctedId: selectedId[]) {
  const chunkSize = 10;
  const batch = writeBatch(db);
  for (let i = 0; i < selctedId.length; i += chunkSize) {
    const chunk = selctedId.slice(i, i + chunkSize);
    // console.log(chunk);
    for (let j = 0; j < chunk.length; j++) {
      // const postId = chunk[j].post;
      // const authorId = chunk[j].author;
      // const sharePostId = chunk[j].share?.post ?? null;
      // const shareauthorId = chunk[j].share?.author ?? null;
      const { post, author, share } = chunk[j];

      if (share?.author && share.post) {
        const sharePostRef = doc(
          db,
          `users/${share?.author}/posts/${share?.post}/shares/${uid}`
        );
        batch.delete(sharePostRef);
      }
      const postRef = doc(db, `users/${author}/posts/${post}`);
      batch.delete(postRef);
      // console.log(post, author, share?.post, share?.author);
      // console.table(chunk[j]);
      // console.log(chunk[j]);
      // console.log(selctedId);
      // if (post.sharePost?.id) {
      //   const id = post.sharePost.id;
      //   const shareRef = doc(
      //     db,
      //     `users/${post.sharePost.author}/posts/${id}/shares/${uid}`
      //   );
      //   // console.log(
      //   //   "Delete this sharedPost" +  + post.sharePost.post?.id
      //   // );
      //   await deleteDoc(shareRef);
      // }
    }
  }
  try {
    await batch.commit();
  } catch (error: any) {
    alert("Delete Failed !" + error.message);
  }
}
