import { initializeApp } from "firebase/app";
import {
  DocumentData,
  DocumentSnapshot,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Post, account } from "../types/interfaces";
import { getUserData } from "./firebaseAdmin";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { getAuth } from "firebase/auth";
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
const uid = getAuth(app).currentUser?.uid;
export async function getProfileByUID(id:string){
  const profileQuery = doc(db, `/users/${id}`);
        const profileSnap = await getDoc(profileQuery);
        const profileData = profileSnap.data()!;
        return profileData.profile as account["profile"];
}
export async function getPostWithMoreInfo(postQuery: Query<DocumentData>) {
  const postSnap = await getDocs(postQuery);

  const originalPosts = await Promise.all(
    postSnap.docs.map(async (doc) => await postToJSON(doc))
  );
  return (await Promise.all(
    originalPosts.map(async (p) => {
      if (p) {
        const profileQuery = doc(db, `/users/${p.authorId}`);
        const profileSnap = await getDoc(profileQuery);
        const profileData = profileSnap.data()!;
        const postAuthorProfile = profileData?.profile as account["profile"];
        if (p.sharePost) {
          const sharedPostRef = doc(
            db,
            `users/${p.sharePost?.author}/posts/${p.sharePost?.id}`
          );
          const sharedPost = await getDoc(sharedPostRef);
          if (sharedPost.exists()) {
            const post = await postToJSON(
              sharedPost as DocumentSnapshot<DocumentData>
            );
            const likeRef = collection(
              db,
              `users/${post.authorId}/posts/${post.id}/likes`
            );
            const likeDoc = await getDocs(likeRef);
            const like = likeDoc.docs.map((doc) => doc.data());
            const likedByUser = doc(
              db,
              `users/${post.authorId}/posts/${post.id}/likes/${uid}`
            );
            const isLiked = await getDoc(likedByUser);
            const profileQuery = doc(db, `/users/${post.authorId}`);
            const profileSnap = await getDoc(profileQuery);
            const profileData = profileSnap.data()!;
            const sharePostProfile = profileData.profile as account["profile"];
            // const sharePost = {
            //   ...post,
            //   author: { ...profile },
            // };
            const sharePost = {
              ...post,
              sharedPost: { ...post.sharePost },
              like: [...like],
              author: { ...sharePostProfile },
              isLiked: isLiked.exists() ? true : false,
            };
            return {
              ...p,
              author: { ...postAuthorProfile },
              sharePost: { ...post.sharePost, post: { ...sharePost } },
            };
          } else {
            return {
              ...p,
              author: { ...postAuthorProfile },
              // author: { ...sharePostProfile },
              sharePost: { ...p.sharePost, post: null },
            };
          }
        } else {
          const likeRef = collection(
            db,
            `users/${p.authorId}/posts/${p.id}/likes`
          );
          const likeDoc = await getDocs(likeRef);
          const like = likeDoc.docs.map((doc) => doc.data());
          const likedByUserRef = doc(
            db,
            `users/${p.authorId}/posts/${p.id}/likes/${uid}`
          );
          const isLiked = await getDoc(likedByUserRef);

          if (!likeDoc.empty) {
            return {
              ...p,
              author: { ...postAuthorProfile },
              like: [...like],
              isLiked: isLiked.exists() ? true : false,
              // sharePost: { ...p.sharePost, post: null }
            };
          } else {
            return {
              ...p,
              author: { ...postAuthorProfile },
              isLiked: false,
              // sharePost: { ...p.sharePost, post: null }
            };
          }
        }
      }
    })
  )) as Post[];
}
