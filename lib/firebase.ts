import { initializeApp } from "firebase/app";
import { AuthErrorCodes } from "firebase/auth";
import {
  DocumentData,
  DocumentSnapshot,
  Query,
  QueryConstraint,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Comment, Post, RecentPosts, account } from "../types/interfaces";
import { Default_Query_LIMIT } from "./QUERY_LIMIT";
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
// type CollectionFunctions = {
//   friends: (hello: string) => CollectionReference<DocumentData>;
//   posts: (uid: string) => CollectionReference<DocumentData>;
//   likes: (postId: string) => CollectionReference<DocumentData>;
//   messages: (userId: string) => CollectionReference<DocumentData>;
// };
const basePath = "users";
export const collectionBasePath = collection(db, `${basePath}`);
export const getCollectionPath = {
  users: ({ uid }: { uid?: string }) => `${basePath}/${uid}`,
  savedPost: ({ uid }: { uid?: string }) =>
    `${getCollectionPath.users({ uid })}/savedPost`,
  friendReqCount: ({ uid }: { uid?: string }) =>
    `${getCollectionPath.users({ uid })}/friendReqCount`,
  notifications: ({ uid }: { uid?: string }) =>
    `${getCollectionPath.users({ uid })}/notifications`,
  friends: ({ uid }: { uid?: string }) =>
    `${getCollectionPath.users({ uid })}/friends`,
  posts: ({ uid }: { uid?: string }) =>
    `${getCollectionPath.users({ uid })}/posts`,
  recentPosts: ({ uid }: { uid?: string }) =>
    `${getCollectionPath.users({ uid })}/recentPosts`,
  comments: ({ authorId, postId }: { authorId?: string; postId?: string }) =>
    `${getCollectionPath.posts({ uid: authorId })}/${postId}/comments`,
  likes: ({ authorId, postId }: { authorId?: string; postId?: string }) =>
    `${getCollectionPath.posts({ uid: String(authorId) })}/${String(
      postId
    )}/likes`,
  // comment_reactions: ({ authorId, postId }: { authorId?: string; postId?: string }) =>
  //   `${getCollectionPath.posts({ uid: String(authorId) })}/${String(
  //     postId
  //   )}/likes`,
  shares: ({ authorId, postId }: { authorId?: string; postId?: string }) =>
    `${getCollectionPath.posts({
      uid: String(authorId),
    })}/${String(postId)}/shares`,
};
export function getPath<T extends keyof typeof getCollectionPath>(
  type: T,
  // params: (typeof getCollectionPath)[T]
  // params: Parameters<(typeof getCollectionPath)[T]>
  params: Parameters<(typeof getCollectionPath)[T]>[0]
) {
  const pathGenerator = getCollectionPath[type];

  if (!pathGenerator) {
    throw new Error(`Invalid collection type: ${type}`);
  }
  // Now use the 'collection' function with the generated path
  return collection(db, pathGenerator(params));
}
export function DescQuery<T>(
  customQuery: Query<T>,
  queryLimit?: number,
  // customOrder?: OrderByDirection,
  ...rest: QueryConstraint[]
) {
  return query(
    customQuery,
    orderBy("createdAt", "desc"),
    limit(queryLimit ?? Default_Query_LIMIT),
    ...rest
  );
}
// export function getPath(
//   type: keyof typeof getCollectionPath,
//   params: string[]
// ) {
//   const pathGenerator = getCollectionPath[type];

//   if (!pathGenerator) {
//     throw new Error(`Invalid collection type: ${type}`);
//   }

//   // if (params.length === 0) {
//   //   return collection(db, pathGenerator({uid:""})); // If no params are provided, use an empty string
//   // }

//   // Call the path generator function with the provided parameters
//   const path = pathGenerator({...params});

//   // Now use the 'collection' function with the generated path
// }
// export function getPath(
//   type: keyof typeof getCollectionPath,
//   ...params: string[]
// ) {
//   const pathGenerator = getCollectionPath[type];
//   if (!pathGenerator) {
//     throw new Error(`Invalid collection type: ${type}`);
//   }

//   if (params.length === 0) {
//     return pathGenerator; // Return the path generator function
//   }

//   // const path = [pathGenerator(...params)].join("/");
//     // const path = params.reduce(
//     //   (result, param) => `${result}/${param}`,
//     //   pathGenerator()
//     // );

//   // const path = pathGenerator(...params);
//   // const path = [pathGenerator(...params)].join('/');

//   // Now use the 'collection' function with the generated path
//   //  return collection(db, pathGenerator(params));
// }
// export function getDocPath(uid: string, docRef: keyof typeof path, id: string) {
//   const path = {
//     posts: `${getCollectionPath.users({uid})}/posts`,
//     friends: `${getCollectionPath.users({uid})}/friends`,
//   };
//   return doc(db, `${path[docRef]}/${id}`);
// }
export async function fethUserDoc(uid: string | string[]) {
  const userQuery = doc(db, getCollectionPath.users({ uid: String(uid) }));
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
    const { authorId, id } = p;
    const shareRef = collection(
      db,
      `${getCollectionPath.shares({
        authorId: String(authorId),
        postId: String(id),
      })}`
    );
    const shareDoc = await getDocs(shareRef);
    const shareCount = shareDoc.size ?? 0;
    const likedByUserRef = doc(
      db,
      `${getCollectionPath.likes({
        authorId: String(authorId),
        postId: String(p.id),
      })}/${uid}`
    );
    const likesRef = collection(
      db,
      `${getCollectionPath.likes({
        authorId: String(authorId),
        postId: String(p.id),
      })}`
    );
    const likeCount = (await getCountFromServer(likesRef)).data().count;
    const commentsRef = collection(
      db,
      `${getCollectionPath.comments({
        authorId: String(authorId),
        postId: String(p.id),
      })}`
    );
    const commentCount = (await getCountFromServer(commentsRef)).data().count;
    // getting total like count from collection Vs likeCount: 2
    const savedByUserRef = doc(
      db,
      `${getCollectionPath.savedPost({ uid })}/${p.id}`
    );

    const [isLiked, isSaved, postProfile] = await Promise.all([
      getDoc(likedByUserRef),
      getDoc(savedByUserRef),
      getProfileByUID(authorId.toString()),
    ]);

    const isUserLikeThisPost = (await getDoc(likedByUserRef)).exists();

    const originalPost = {
      ...p,
      // likeCount: p.likeCount ?? 0,
      commentCount,
      likeCount: likeCount,
      author: { ...postProfile },
      shareCount,
      sharePost: { ...p.sharePost, post: null },
      isLiked: isUserLikeThisPost,
      isSaved: isSaved.exists() ? true : false,
    } as Post;
    if (p.sharePost) {
      const { author, id } = p.sharePost;
      const sharedPostRef = doc(
        db,
        `${getCollectionPath.posts({ uid: author })}/${id}`
      );
      const shareDoc = await getDoc(sharedPostRef);
      const isSharedPostAvailable = shareDoc.exists();

      const sharedPost = await postToJSON(shareDoc);
      const { authorId, likeCount } = sharedPost;
      const SharedPostRef = collection(
        db,
        getCollectionPath.shares({
          authorId: String(authorId),
          postId: String(sharedPost.id),
        })
      );
      const sharelikedByUser = doc(
        db,
        `${getCollectionPath.likes({
          authorId: String(authorId),
          postId: String(sharedPost.id),
        })}/${uid}`
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
  recentPosts?: RecentPosts[]
): Promise<Post[] | undefined> {
  console.log("posts are fetched");
  if (recentPosts) {
    const data = await Promise.all(
      recentPosts.map(async (recentPost) => {
        const { id, recentId, authorId, createdAt } = recentPost;
        // if (!post.authorId) return null;
        const postRef = doc(
          db,
          `${getCollectionPath.posts({ uid: authorId })}/${id}`
        );
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
          const postData = await postToJSON(postDoc);
          const postData2 = {
            ...postData,
            id: recentPost.id,
            recentId: recentPost.recentId,
          };
          const postwithInfo = await postInfo(postData2, uid);
          // const withRecentPostDate = {
          //   ...postwithInfo,
          //   // createdAt:JSONTimestampToDate(createdAt).toJSON()
          //   // createdAt:new Timestamp(createdAt.seconds,createdAt.nanoseconds),
          // };
          return postwithInfo;
        } else {
          // const postwithInfo = await postInfo(recentPost, uid);
          const postProfile = await getProfileByUID(authorId.toString());
          return {
            ...recentPost,
            id: recentPost.recentId,
            recentId: recentPost.recentId,
            author: {
              ...postProfile,
            },
            deletedByAuthor: true,
          };
        }
      })
    );
    // console.log(data.filter((p) => p));
    // return data.filter((p) => p) as Post[];
    return data as Post[];
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
