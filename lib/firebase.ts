import { initializeApp } from "firebase/app";
import { AuthErrorCodes } from "firebase/auth";
import {
  DocumentData,
  DocumentSnapshot,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Comment, Post, account } from "../types/interfaces";
export const firebaseConfig = {
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
export function JSONTimestampToDate(date: Timestamp | Post["createdAt"]) {
  return new Timestamp(date?.seconds, date?.nanoseconds).toDate();
}
export async function postToJSON(
  doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>
): Promise<Post> {
  const data = doc.data() as Post;
  const createdAt = data?.createdAt as Timestamp;
  const updatedAt = data?.updatedAt as Timestamp;
  const author = doc.ref.parent.parent!;
  if (typeof data?.updatedAt === "string") {
    return {
      ...data,
      media: data?.media ?? [],
      authorId: author.id,
      id: doc.id,
      text: data?.text ?? "",
      createdAt: createdAt?.toJSON() || 0,
    };
  } else {
    return {
      ...data,
      media: data?.media ?? [],
      authorId: author.id,
      id: doc.id,
      text: data?.text ?? "",
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

  // if (typeof data?.updatedAt === "string") {
  //   // return {
  //   //   ...data,
  //   //   id: doc.id,
  //   //   text: data?.text,
  //   //   createdAt: createdAt?.toJSON() || 0,
  //   // };
  //   commentDateToJSON(data as Comment);
  // } else {
  //   return {
  //     ...commentDateToJSON(data as Comment),
  //     updatedAt: updatedAt?.toJSON() || 0,
  //   };
  // }
}
export function commentDateToJSON(data: Comment) {
  const createdAt = data?.createdAt as Timestamp;
  return {
    ...data,
    text: data?.text,
    createdAt: createdAt?.toJSON() || 0,
  };
}
export function userToJSON<T>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => userToJSON(item));
  } else if (typeof obj === "object" && obj !== null) {
    const modifiedObj = { ...obj };
    for (const key in modifiedObj) {
      if (Object.prototype.hasOwnProperty.call(modifiedObj, key)) {
        modifiedObj[key] = userToJSON(modifiedObj[key]);
        // encodedProfileURL
      }
    }
    return modifiedObj;
  } else if (obj === undefined) {
    return null;
  }
  return obj;
}
export async function getProfileByUID(id: string) {
  const userDoc = await fethUserDoc(id);
  const profileData = userDoc.data()!;
  return (profileData?.profile as account["profile"]) ?? null;
} 
export async function postInfo(p: Post, uid: string): Promise<Post> {
  if (p.authorId) {
    const { authorId } = p;
    const shareRef = collection(db, `users/${p.authorId}/posts/${p.id}/shares`);
    const shareDoc = await getDocs(shareRef);
    const shareCount = shareDoc.size ?? 0;
    const likedByUserRef = doc(
      db,
      `users/${authorId}/posts/${p.id}/likes/${uid}`
    );
    const likesRef = collection(db, `users/${authorId}/posts/${p.id}/likes`);
    const likeCount = (await getCountFromServer(likesRef)).data().count;
    // getting total like count from collection Vs likeCount: 2
    const savedByUserRef = doc(db, `users/${uid}/savedPost/${p.id}`);

    const [isLiked, isSaved, postProfile] = await Promise.all([
      getDoc(likedByUserRef),
      getDoc(savedByUserRef),
      getProfileByUID(authorId.toString()),
    ]);

    const isUserLikeThisPost = (await getDoc(likedByUserRef)).exists();

    const originalPost = {
      ...p,
      // likeCount: p.likeCount ?? 0,
      likeCount: likeCount,
      author: { ...postProfile },
      shareCount,
      sharePost: { ...p.sharePost, post: null },
      isLiked: isUserLikeThisPost,
      isSaved: isSaved.exists() ? true : false,
    } as Post;
    if (p.sharePost) {
      const { author, id } = p.sharePost;
      const sharedPostRef = doc(db, `users/${author}/posts/${id}`);
      const shareDoc = await getDoc(sharedPostRef);
      const isSharedPostAvailable = shareDoc.exists();

      const sharedPost = await postToJSON(shareDoc);
      const { authorId, likeCount } = sharedPost;
      const SharedPostRef = collection(
        db,
        `users/${authorId}/posts/${sharedPost.id}/shares`
      );
      const sharelikedByUser = doc(
        db,
        `users/${authorId}/posts/${sharedPost.id}/likes/${uid}`
      );
      const [isSharePostLiked, sharePostProfile, SharedPostShareDoc] =
        await Promise.all([
          getDoc(sharelikedByUser),
          getProfileByUID(authorId.toString()),
          getDocs(SharedPostRef),
        ]);

      const sharePost = {
        ...sharedPost,
        likeCount: likeCount ?? 0,
        author: { ...sharePostProfile },
        shareCount: SharedPostShareDoc.size ?? 0,
        isLiked: isSharePostLiked.exists() ? true : false,
      };
      if (isSharedPostAvailable) {
        return {
          ...originalPost,
          shareCount: shareCount,
          author: { ...postProfile },
          isLiked: isLiked.exists() ? true : false,
          sharePost: { ...p.sharePost, post: { ...sharePost } },
        };
      } else {
        return {
          ...p,
          shareCount: shareCount,
          isLiked: isLiked.exists() ? true : false,
          author: { ...postProfile },
          sharePost: { ...p.sharePost, post: null },
        };
      }
    } else {
      return { ...originalPost };
    }
  }
  return p;
}
export async function getNewsFeed(
  uid: string,
  newsFeedPosts?: any[]
): Promise<Post[] | undefined> {
  console.log("posts are fetched");
  if (newsFeedPosts) {
    const data = await Promise.all(
      newsFeedPosts.map(async (post) => {
        // if (!post.authorId) return null;
        const postRef = doc(db, `users/${post.authorId}/posts/${post.id}`);
        const postDoc = await getDoc(postRef);
        const postData = await postToJSON(postDoc);
        const postwithInfo = await postInfo(postData, uid);
        return postwithInfo;
      })
    );

    return data;
  }
}
export async function getPostWithMoreInfo(
  uid: string,
  postQuery?: Query<DocumentData>,
  snapShot?: QuerySnapshot<DocumentData>
) {
  const postSnap = postQuery ? await getDocs(postQuery as Query) : snapShot;
  console.log("posts are fetched");
  if (postSnap) {
    const postJSON = await Promise.all(
      postSnap.docs.map(async (doc) => await postToJSON(doc))
    );

    try {
      return (await Promise.all(
        postJSON.map(async (p) => {
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
      // return null;
    }
  }
  // return null;
}
