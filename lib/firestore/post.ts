import { TSavedPost } from "@/pages/saved";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { User } from "firebase/auth";
import {
  DocumentData,
  DocumentReference,
  Query,
  Timestamp,
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
  where,
  writeBatch,
} from "firebase/firestore";
import { selectedPosts } from "../../context/PageContext";
import { Post, RecentPosts, friend, likes } from "../../types/interfaces";
import { MYPOST_LIMIT, NewsFeed_LIMIT } from "../QUERY_LIMIT";
import {
  DescQuery,
  db,
  getCollectionPath,
  getPath,
  getPostWithMoreInfo,
  getProfileByUID,
  postInfo,
  postToJSON,
} from "../firebase";
import { getMessage, sendAppNoti, sendFCM } from "./notifications";
import { checkPhotoURL } from "./profile";
type TAddPost = {
  uid: string;
  post: {
    text?: Post["text"];
    visibility: Post["visibility"] | string;
    media?: Post["media"];
  };
  sharePost?: { refId: string; author: string; id: string } | null;
  friends: friend[];
};
export async function addPost({ uid, post, sharePost, friends }: TAddPost) {
  const Ref = !sharePost
    ? doc(getPath("posts", { uid }))
    : doc(db, `${getCollectionPath.posts({ uid })}/${sharePost.refId}`);
  const postId = !sharePost ? Ref.id : sharePost.refId;
  const newsFeedPost = {
    authorId: uid,
    id: postId,
    createdAt: serverTimestamp(),
  };
  const haveFriends = friends && friends?.length > 0;
  if (haveFriends) {
    if (post.visibility === "Public" || "Friend") {
      if (post.visibility !== "Onlyme") {
        friends?.map(async (friendId) => {
          const friendNewsFeedRef = doc(
            getPath("recentPosts", { uid: String(friendId) })
          );
          try {
            await setDoc(friendNewsFeedRef, newsFeedPost);
            console.log(`added post to ${friendId}`);
          } catch (error) {
            console.log(error);
            throw error;
          }
        });
      }
    }
  }
  const adminNewsFeedRef = doc(getPath("recentPosts", { uid }));
  try {
    await setDoc(adminNewsFeedRef, newsFeedPost);
  } catch (error) {
    console.log(error);
    throw error;
  }
  const postData = {
    authorId: uid,
    id: postId,
    // id: !sharePost ? Ref.id : sharePost.refId,
    ...post,
    createdAt: serverTimestamp(),
    updatedAt: "Invalid Date",
  };
  let data;
  if (sharePost) {
    const sharersRef = doc(
      db,
      `${getCollectionPath.shares({
        authorId: sharePost.author,
        postId: sharePost.id,
      })}/${uid}`
    );
    data = {
      ...post,
      sharePost,
      createdAt: serverTimestamp(),
      updatedAt: "Invalid Date",
    };
    await updatePostSharer(sharersRef);
  } else {
    data = { ...postData };
  }
  try {
    console.table({ addedPost: data });
    return await setDoc(Ref, data);
  } catch (error: unknown) {
    alert("Post upload failed !" + error);
  }

  async function updatePostSharer(sharersRef: DocumentReference<DocumentData>) {
    try {
      await setDoc(sharersRef, { uid });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
export async function fetchRecentPosts(uid: string) {
  const newsFeedQuery = DescQuery(
    getPath("recentPosts", { uid }),
    NewsFeed_LIMIT + 1
  );
  let recentPosts: RecentPosts[] = [],
    hasMore = false;
  try {
    recentPosts = (await getDocs(newsFeedQuery)).docs.map((doc) => {
      return {
        ...(doc.data() as RecentPosts),
        recentId: doc.id,
        createdAt: doc.data().createdAt?.toJSON() || 0,
      };
    });
    hasMore = recentPosts.length > NewsFeed_LIMIT;

    if (hasMore) {
      // console.log("there is hasMore newsfeed");
      recentPosts.pop();
    }
  } catch (error) {
    console.log("Recent Post Error - ", error);
  }
  return { recentPosts, hasMore };
}
export const myPostFilterQuery = {
  isFriend: where("visibility", "in", ["Friend", "Public"]),
  isPublic: where("visibility", "==", "Public"),
};
export async function getPostsByUser(
  uid: string,
  isFriend: boolean,
  isBlocked: boolean,
  token: DecodedIdToken
) {
  let mypostQuery: Query<DocumentData> | null = null;
  const isAdmin = uid === token.uid;
  const LIMIT = MYPOST_LIMIT + 1;
  const postPath = getPath("posts", { uid });
  const visibilityCondition = {
    isFriend: DescQuery(postPath, LIMIT, myPostFilterQuery["isFriend"]),
    isAdmin: query(postPath, orderBy("createdAt", "desc"), limit(LIMIT)),
    fallback: DescQuery(postPath, LIMIT, myPostFilterQuery["isPublic"]),
  };
  if (isFriend) {
    mypostQuery = visibilityCondition["isFriend"];
  } else if (isAdmin) {
    mypostQuery = visibilityCondition["isAdmin"];
  } else {
    mypostQuery = visibilityCondition["fallback"];
  }
  let hasMore = false;
  const myPost = !isBlocked
    ? await getPostWithMoreInfo(token.uid, mypostQuery)
    : [];
  // myPost?.shift();
  hasMore = (myPost?.length ?? 0) > MYPOST_LIMIT;
  if (hasMore) {
    myPost?.pop();
  }
  return { myPost, hasMore };
}
export async function getPostBySavedId(data: TSavedPost[], uid: string) {
  return await Promise.all(
    data.map(async (savedPost) => {
      const { authorId, postId } = savedPost;
      const postDoc = doc(
        db,
        `${getCollectionPath.posts({ uid: authorId })}/${postId}`
      );

      const post = await postToJSON(await getDoc(postDoc));
      const posts = await postInfo(post, uid);
      console.log({ posts });
      return posts;
    })
  );
}
export async function updatePost(
  uid: string,
  text: string,
  files: Post["media"],
  id: string,
  myPost: Post,
  visibility: string
) {
  const Ref = doc(db, `${getCollectionPath.posts({ uid })}/${id}`);
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
    console.table({ updatedData: data });
    await updateDoc(Ref, data);
  } catch (error: unknown) {
    alert("Updating Post Failed !" + error);
    throw new Error(`${error}`);
  }
}
export async function deletePost(data: {
  uid: string;
  deleteURL: string;
  post: Post;
}) {
  const { uid, deleteURL, post } = data;
  console.log({ data });
  if (!post.deletedByAuthor && uid !== post?.authorId) {
    alert("Unauthorized user!");
    return;
  }
  const Ref = doc(db, deleteURL);
  const isPostAvailable = (await getDoc(Ref)).exists();
  if (!isPostAvailable) {
    alert("Delete Error! Post already deleted.");
    throw new Error("Delete Error! Post already deleted.");
  }
  if (post && post.sharePost?.id) {
    const sharePostId = post.sharePost.id;
    const shareRef = doc(
      db,
      `${getCollectionPath.shares({
        authorId: post.sharePost.author,
        postId: sharePostId,
      })}/${uid}`
    );
    await deleteDoc(shareRef);
  }
  try {
    await deleteDoc(Ref);
  } catch (error: unknown) {
    console.error(error);
    alert("Delete Failed !" + error);
  }
}
export async function deleteMultiplePost(
  uid: string,
  selctedId: selectedPosts[]
) {
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
      const { postId, authorId, share } = chunk[j];
      //Delete sharePost user
      if (share?.authorId && share.postId) {
        const { authorId: shareAuthorId, postId: sharePostId } = share;
        const sharePostRef = doc(
          db,
          `${getCollectionPath.shares({
            authorId: shareAuthorId,
            postId: sharePostId,
          })}/${uid}`
        );
        batch.delete(sharePostRef);
      }
      const postRef = doc(
        db,
        `${getCollectionPath.posts({ uid: authorId })}/${postId}`
      );
      batch.delete(postRef);
      // if (post.sharePost?.id) {
      //   const id = post.sharePost.id;

      //   // console.log(
      //   //   "Delete this sharedPost" +  + post.sharePost.post?.id
      //   // );
      //   await deleteDoc(shareRef);
      // }
    }
  }
  try {
    await batch.commit();
  } catch (error: unknown) {
    alert("Delete Failed !" + error);
  }
}
export async function reactPost({
  postRef,
  likeRef,
  uid,
  post,
  profile,
  currentUser,
}: {
  postRef: DocumentReference<DocumentData>;
  likeRef: DocumentReference<DocumentData>;
  uid: string;
  post: Post;
  profile: (User & { photoURL_cropped?: string | undefined }) | null;
  currentUser: (User & { photoURL_cropped?: string | undefined }) | null;
}) {
  const batch = writeBatch(db);
  batch.set(likeRef, { uid, createdAt: serverTimestamp() });
  batch.update(postRef, {
    likeCount: increment(1),
  });
  await batch.commit();
  console.log("liked post");
  const { authorId, id } = post;
  // if (uid === authorId) return;
  await sendAppNoti({
    uid,
    receiptId: authorId,
    profile,
    type: "post_reaction",
    url: `${authorId}/${id}`,
  });

  await sendFCM({
    timestamp: Date.now(),
    image: post.media?.[0] ? post.media?.[0].url : "",
    recieptId: authorId.toString(),
    message: `${profile?.displayName ?? "Unknown User"} ${getMessage(
      "post_reaction"
    )}`,
    icon: checkPhotoURL(currentUser?.photoURL_cropped ?? currentUser?.photoURL),
    tag: `Likes-${id}`,
    link: `/${authorId}/${id}`,
  });
}
export async function unReactPost({
  likeCount,
  postRef,
  likeRef,
}: {
  likeCount: number;
  postRef: DocumentReference<DocumentData>;
  likeRef: DocumentReference<DocumentData>;
}) {
  if (likeCount <= 0) return;
  const batch = writeBatch(db);
  batch.delete(likeRef);
  batch.update(postRef, {
    likeCount: likeCount > 0 ? increment(-1) : likeCount,
  });
  await batch.commit();
  console.log("unliked post");
}
export async function fetchLikedUsers(post: Post) {
  const likeRef = DescQuery(
    getPath("likes", {
      authorId: String(post.authorId),
      postId: String(post.id),
    })
  );
  try {
    const likeDoc = await getDocs(likeRef);
    const likes = likeDoc.docs.map((doc) => doc.data()) as likes[];
    const withAuthor = await Promise.all(
      likes.map(async (like) => {
        const author = await getProfileByUID(String(like.uid));
        return { ...like, author };
      })
    );
    return withAuthor;
  } catch (error) {
    console.log(error);
    throw Error;
  }
}
