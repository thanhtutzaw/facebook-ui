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
  getDoc,
  getDocs,
  getFirestore,
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
export function JSONTimestampToDate(date: Timestamp | Post["createdAt"]) {
  // if(!data instanceof Timestamp) return;
  // if (!date) return;
  return new Timestamp(date?.seconds, date?.nanoseconds).toDate();
}
export async function postToJSON(
  doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>
) {
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
  const userDoc = await fethUserDoc(id);
  const profileData = userDoc.data()!;
  return (profileData?.profile as account["profile"]) ?? null;
}
export async function postInfo(p: Post, uid: string) {
  if (p.authorId) {
    // console.log("returning postInfo");
    const shareRef = collection(db, `users/${p.authorId}/posts/${p.id}/shares`);
    const shareDoc = await getDocs(shareRef);
    const shareCount = shareDoc.size ?? 0;
    const likedByUserRef = doc(
      db,
      `users/${p.authorId}/posts/${p.id}/likes/${uid}`
    );
    const savedByUserRef = doc(db, `users/${uid}/savedPost/${p.id}`);

    const [isLiked, isSaved, postProfile] = await Promise.all([
      getDoc(likedByUserRef),
      getDoc(savedByUserRef),
      getProfileByUID(p.authorId.toString()),
    ]);
    const originalPost = {
      ...p,
      likeCount: p.likeCount ?? 0,
      author: { ...postProfile },
      shareCount,
      sharePost: { ...p.sharePost, post: null },
      isLiked: isLiked.exists() ? true : false,
      isSaved: isSaved.exists() ? true : false,
    };
    // console.log("posts with info are fetching");
    if (p.sharePost) {
      const sharedPostRef = doc(
        db,
        `users/${p.sharePost?.author}/posts/${p.sharePost?.id}`
      );
      const shareDoc = await getDoc(sharedPostRef);
      const isSharedPostAvailable = shareDoc.exists();

      const sharedPost = await postToJSON(shareDoc);
      const SharedPostShareRef = collection(
        db,
        `users/${sharedPost.authorId}/posts/${sharedPost.id}/shares`
      );
      const sharelikedByUser = doc(
        db,
        `users/${sharedPost.authorId}/posts/${sharedPost.id}/likes/${uid}`
      );
      const [isSharePostLiked, sharePostProfile, SharedPostShareDoc] =
        await Promise.all([
          getDoc(sharelikedByUser),
          getProfileByUID(sharedPost.authorId.toString()),
          getDocs(SharedPostShareRef),
        ]);

      const sharePost = {
        ...sharedPost,
        likeCount: sharedPost.likeCount ?? 0,
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
  return null;
}
export async function getPostsbyId(uid: string, posts?: any[]) {
  // const postSnap = postQuery ? await getDocs(postQuery as Query) : snapShot;
  console.log("posts are fetched");
  if (posts) {
    const data = await Promise.all(
      posts.map(async (post) => {
        if (!post.authorId) return null;
        const postRef = doc(db, `users/${post.authorId}/posts/${post.id}`);
        const postDoc = await getDoc(postRef);
        const postData = await postToJSON(postDoc);
        const postwithInfo = await postInfo(postData, uid);
        return postwithInfo;
      })
    );
    return data as Post[];
    // console.log(data);
    // const postJSON = await Promise.all(
    //   // postSnap.docs.map(async (doc) => await postToJSON(doc))
    //   // post.

    // );

    // try {
    //   return (await Promise.all(
    //     // postJSON.map(async (p) => {
    //     //   return await postInfo(p, uid);
    //     // })
    //   )) as Post[];
    // } catch (error: any) {
    //   if (error === AuthErrorCodes.QUOTA_EXCEEDED) {
    //     console.log(AuthErrorCodes.QUOTA_EXCEEDED);
    //     alert("Firebase Quota Exceeded. Please try again later.");
    //     throw error;
    //   }
    //   if (error.code === "quota-exceeded") {
    //     alert("Firebase Quota Exceeded. Please try again later.");
    //     throw error;
    //   }
    //   // return null;
    // }
  }
  // return null;
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
