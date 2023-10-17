import {
  DocumentData,
  DocumentReference,
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { selectedId } from "../../context/PageContext";
import { Post, friends, likes } from "../../types/interfaces";
import { db, getProfileByUID } from "../firebase";
import { LikedUsers_LIMIT } from "../QUERY_LIMIT";
export async function addPost(
  uid: string,
  visibility: string,
  text: string,
  files?: any[],
  sharePost?: { refId: string; author: string; id: string } | null,
  friends?: friends[]
) {
  const Ref = !sharePost
    ? doc(collection(db, `users/${uid}/posts`))
    : doc(db, `users/${uid}/posts/${sharePost.refId}`);
  const postId = !sharePost ? Ref.id : sharePost.refId;
  const newsFeedPost = {
    authorId: uid,
    id: postId,
    createdAt: serverTimestamp(),
  };
  const hasFriends = friends && friends?.length > 0;
  if (hasFriends) {
    if (visibility !== "Public" || "Friend") {
    } else {
      console.log({ sharePost });
      console.log({ friends });

      friends?.map(async (friendId) => {
        const friendNewsFeedRef = doc(
          collection(db, `users/${friendId}/recentPosts`)
        );
        try {
          await setDoc(friendNewsFeedRef, newsFeedPost);
        } catch (error) {
          console.log(error);
          throw error;
        }
      });
    }
  }
  const adminNewsFeedRef = doc(collection(db, `users/${uid}/recentPosts`));
  try {
    await setDoc(adminNewsFeedRef, newsFeedPost);
  } catch (error) {
    console.log(error);
    throw error;
  }
  const post = {
    authorId: uid,
    id: postId,
    // id: !sharePost ? Ref.id : sharePost.refId,
    text,
    media: files,
    visibility,
    createdAt: serverTimestamp(),
    updatedAt: "Invalid Date",
  };
  let data;
  if (sharePost) {
    const sharersRef = doc(
      collection(
        db,
        `users/${sharePost?.author}/posts/${sharePost?.id}/shares/${uid}`
      )
    );
    data = {
      ...post,
      sharePost,
    };
    try {
      await setDoc(sharersRef, { uid });
    } catch (error) {
      console.log(error);
      throw error;
    }
  } else {
    data = { ...post };
  }
  try {
    console.log({ addedPost: data });
    return await setDoc(Ref, data);
  } catch (error: any) {
    alert("Post upload failed !" + error.message);
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
  if (myPost.sharePost && myPost.sharePost?.id) {
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
export async function deleteMultiplePost(uid: string, selctedId: selectedId[]) {
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
    likeCount: increment(1),
    // likeCount: likeCount,
  });
  await batch.commit();
  console.log("liked post");
}
export async function fetchLikedUsers(p: Post) {
  const likeRef = query(
    collection(db, `users/${p.authorId}/posts/${p.id}/likes`),
    orderBy("createdAt", "desc"),
    limit(LikedUsers_LIMIT)
  );
  try {
    const likeDoc = await getDocs(likeRef);
    const likes = likeDoc.docs.map((doc) => doc.data()) as likes;
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
export async function unlikePost(
  likeCount: number,
  postRef: DocumentReference<DocumentData>,
  likeRef: DocumentReference<DocumentData>
) {
  if (likeCount <= 0) return;
  const batch = writeBatch(db);

  batch.delete(likeRef);
  batch.update(postRef, {
    likeCount: likeCount > 0 ? increment(-1) : likeCount,
    // likeCount: likeCount > 0 ? likeCount : likeCount,
  });
  await batch.commit();
  console.log("unliked post");
}
