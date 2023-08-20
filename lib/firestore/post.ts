import {
  DocumentData,
  DocumentReference,
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { selectedId } from "../../context/PageContext";
import { Post, likes } from "../../types/interfaces";
import { db, getProfileByUID } from "../firebase";
export async function addPost(
  uid: string,
  visibility: string,
  text: string,
  files?: any[],
  sharePost?: { refId: string; author: string; id: string }
) {
  // const Ref = doc(collection(db, `users/${uid}/posts`));
  const Ref = !sharePost
    ? doc(collection(db, `users/${uid}/posts`))
    : doc(db, `users/${uid}/posts/${sharePost.refId}`);
  const post = {
    id: !sharePost ? Ref.id : sharePost.refId,
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
  if (sharePost) {
    data = {
      ...post,
      sharePost,
    };
    await setDoc(sharersRef, { uid });
  } else {
    data = { ...post };
  }
  try {
    console.log({ data });
    return await setDoc(Ref, data);
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
    alert("Updating Post Failed !" + error.message);
  }
}
export async function deletePost(data: any) {
  const { uid, postid, post } = data;
  const Ref = doc(db, `users/${uid}/posts/${postid.toString()}`);
  const exist = (await getDoc(Ref)).exists();
  if (!exist) {
    alert("Delete Error : Data Not Found");
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

export async function likePost(
  likeCount: number,
  postRef: DocumentReference<DocumentData>,
  likeRef: DocumentReference<DocumentData>,
  uid: string
) {
  const batch = writeBatch(db);
  batch.set(likeRef, { uid, createdAt: serverTimestamp() });
  batch.update(postRef, {
    // likeCount: increment(1),
    likeCount: likeCount + 1,
    // likeCount:likeCount
  });
  await batch.commit();
}
export async function fetchLikedUsers(p: Post) {
  const likeRef = collection(db, `users/${p.authorId}/posts/${p.id}/likes`);
  try {
    const likeDoc = await getDocs(likeRef);
    const likes = likeDoc.docs.map((doc) => doc.data()) as likes;
    // const withAuthor = {...likes , {author:await getProfileByUID(likes.uid)}}
    const withAuthor = await Promise.all(
      likes.map(async (l) => {
        if (l.uid) {
          const author = await getProfileByUID(l.uid?.toString());
          return { ...l, author };
        } else {
          return { ...l, author: null };
        }
      })
    );
    return withAuthor;
  } catch (error) {
    console.log(error);
    throw Error;
  }
}
export async function dislikePost(
  likeCount: number,
  postRef: DocumentReference<DocumentData>,
  likeRef: DocumentReference<DocumentData>
) {
  const batch = writeBatch(db);

  batch.delete(likeRef);
  batch.update(postRef, {
    // likeCount: increment(-1),
    likeCount: likeCount - 1,
    // likeCount:likeCount
  });
  await batch.commit();
}
