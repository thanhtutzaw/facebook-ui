import { initializeApp } from "firebase/app";
import { AuthErrorCodes } from "firebase/auth";
import {
  DocumentData,
  DocumentSnapshot,
  Query,
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Comment, Post, account } from "../types/interfaces";
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: "G-ME0NSYLYR3",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();
const storage = getStorage(app);
export { app, db, storage };

export async function fethUserDoc(uid: string | string[]) {
  const userQuery = doc(db, `users/${uid}`);
  const user = await getDoc(userQuery);
  return user!;
}
export async function postToJSON(
  doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>
) {
  const data = doc.data() as Post;
  const createdAt = data?.createdAt as Timestamp;
  const updatedAt = data?.updatedAt as Timestamp;
  const author = doc.ref.parent.parent!;
  // const user = (await getUserData(author.id)) as UserRecord;
  if (typeof data?.updatedAt === "string") {
    return {
      ...data,
      media: data?.media ?? [],
      authorId: author.id,
      // autherName: user.displayName ?? "Unknown",
      id: doc.id,
      text: data?.text,
      createdAt: createdAt?.toJSON() || 0,
    };
  } else {
    return {
      ...data,
      media: data?.media ?? [],
      authorId: author.id,
      // autherName: user.displayName ?? "Unknown",
      id: doc.id,
      text: data?.text,
      createdAt: createdAt?.toJSON() || 0,
      updatedAt: updatedAt?.toJSON() || 0,
    };
  }
}
export async function commentToJSON(doc: QueryDocumentSnapshot<DocumentData>) {
  const data = doc.data() as Comment;
  const createdAt = data?.createdAt as Timestamp;
  const updatedAt = data?.updatedAt as Timestamp;
  const author = doc.ref.parent.parent?.parent.parent!;
  if (typeof data?.updatedAt === "string") {
    return {
      ...data,
      id: doc.id,
      text: data?.text,
      createdAt: createdAt?.toJSON() || 0,
    };
  } else {
    return {
      ...data,
      id: doc.id,
      text: data?.text,
      createdAt: createdAt?.toJSON() || 0,
      updatedAt: updatedAt?.toJSON() || 0,
    };
  }
}
export function userToJSON(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item: any) => userToJSON(item));
  } else if (typeof obj === "object" && obj !== null) {
    const modifiedObj = { ...obj };
    for (const key in modifiedObj) {
      if (Object.prototype.hasOwnProperty.call(modifiedObj, key)) {
        modifiedObj[key] = userToJSON(modifiedObj[key]);
      }
    }
    return modifiedObj;
  } else if (obj === undefined) {
    return null;
  }
  return obj;
}
export async function getProfileByUID(id: string) {
  const profileQuery = doc(db, `/users/${id}`);
  const profileSnap = await getDoc(profileQuery);
  const profileData = profileSnap.data()!;
  return profileData.profile as account["profile"];
}
export async function postInfo(p: Post, uid: string) {
  const postProfile = await getProfileByUID(p.authorId.toString());

  // const commentRef = query(
  //   collection(db, `users/${p.authorId}/posts/${p.id}/comments`),
  //   orderBy("createdAt", "desc")
  // );
  // const commentDoc = await getDocs(commentRef);
  // const commentJSON = await Promise.all(
  //   commentDoc.docs.map(async (doc) => await commentToJSON(doc))
  // );

  // const comments = await Promise.all(
  //   commentJSON.map(async (c) => {
  //     const author = await getProfileByUID(c.authorId);
  //     return { ...c, author };
  //   })
  // );
  // console.log(comments);
  const likeRef = collection(db, `users/${p.authorId}/posts/${p.id}/likes`);
  const likeDoc = await getDocs(likeRef);
  const like = likeDoc.docs.map((doc) => doc.data());
  const shareRef = collection(db, `users/${p.authorId}/posts/${p.id}/shares`);
  const shareDoc = await getDocs(shareRef);
  const shares = shareDoc.docs.map((doc) => doc.data());
  const likedByUserRef = doc(
    db,
    `users/${p.authorId}/posts/${p.id}/likes/${uid}`
  );
  const isLiked = await getDoc(likedByUserRef);
  const savedByUserRef = doc(db, `users/${uid}/savedPost/${p.id}`);
  const isSaved = await getDoc(savedByUserRef);
  const originalPost = {
    ...p,
    // comments: [...comments],
    author: { ...postProfile },
    shares: [...shares],
    like: [...like],
    sharePost: { ...p.sharePost, post: null },
    isLiked: isLiked.exists() ? true : false,
    isSaved: isSaved.exists() ? true : false,
  };
  if (p.sharePost) {
    const sharedPostRef = doc(
      db,
      `users/${p.sharePost?.author}/posts/${p.sharePost?.id}`
    );
    const shareDoc = await getDoc(sharedPostRef);
    const isSharedPostAvailable = shareDoc.exists();

    const sharedPost = await postToJSON(shareDoc);
    const SharedPostLikeRef = collection(
      db,
      `users/${sharedPost.authorId}/posts/${sharedPost.id}/likes`
    );
    const SharedPostLikeDoc = await getDocs(SharedPostLikeRef);
    const sharelike = SharedPostLikeDoc.docs.map((doc) => doc.data());
    const SharedPostShareRef = collection(
      db,
      `users/${sharedPost.authorId}/posts/${sharedPost.id}/shares`
    );
    const SharedPostShareDoc = await getDocs(SharedPostShareRef);
    const shareShares = SharedPostShareDoc.docs.map((doc) => doc.data());
    const sharelikedByUser = doc(
      db,
      `users/${sharedPost.authorId}/posts/${sharedPost.id}/likes/${uid}`
    );
    const isSharePostLiked = await getDoc(sharelikedByUser);

    const sharePostProfile = await getProfileByUID(
      sharedPost.authorId.toString()
    );

    const sharePost = {
      ...sharedPost,
      author: { ...sharePostProfile },
      like: [...sharelike],
      shares: [...shareShares],
      isLiked: isSharePostLiked.exists() ? true : false,
    };
    if (isSharedPostAvailable) {
      return {
        ...originalPost,
        // comments: [...comments],
        like: [...like],
        shares: [...shares],
        author: { ...postProfile },
        isLiked: isLiked.exists() ? true : false,
        sharePost: { ...p.sharePost, post: { ...sharePost } },
      };
    } else {
      return {
        // ...originalPost,
        ...p,
        // comments: [...comments],
        like: [...like],
        shares: [...shares],
        isLiked: isLiked.exists() ? true : false,
        author: { ...postProfile },
        sharePost: { ...p.sharePost, post: null },
      };
    }
  } else {
    return { ...originalPost };
  }
}
export async function getPostWithMoreInfo(
  postQuery: Query<DocumentData>,
  uid: string
) {
  const postSnap = await getDocs(postQuery);

  const originalPosts = await Promise.all(
    postSnap.docs.map(async (doc) => await postToJSON(doc))
  );

  try {
    return (await Promise.all(
      originalPosts.map(async (p) => {
        return await postInfo(p, uid);
      })
    )) as Post[];
  } catch (error: any) {
    if (error === AuthErrorCodes.QUOTA_EXCEEDED) {
      console.log(AuthErrorCodes.QUOTA_EXCEEDED);
      alert("Firebase Quota Exceeded. Please try again later.");
      throw error;
    }
    if (error.code === "quota-exceeded") {
      alert("Firebase Quota Exceeded. Please try again later.");
      throw error;
    }
  }
}
