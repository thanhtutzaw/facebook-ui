import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import {
  DocumentData,
  DocumentReference,
  Timestamp,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { selectedId } from "../../context/PageContext";
import { Post, RecentPosts, friends, likes } from "../../types/interfaces";
import { MYPOST_LIMIT, NewsFeed_LIMIT } from "../QUERY_LIMIT";
import {
  DescQuery,
  db,
  getCollectionPath,
  getPath,
  getPostWithMoreInfo,
  getProfileByUID,
} from "../firebase";
type TAddPost = {
  uid: string;
  post: {
    text?: Post["text"];
    visibility: Post["visibility"] | string;
    media?: Post["media"];
  };
  sharePost?: { refId: string; author: string; id: string } | null;
  friends: friends[];
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
  } catch (error: any) {
    alert("Post upload failed !" + error.message);
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
        ...(doc.data() as any),
        recentId: doc.id,
        createdAt: doc.data().createdAt?.toJSON() || 0,
      };
    });
    hasMore = recentPosts.length > NewsFeed_LIMIT;
    console.log({
      rlenght: recentPosts.length,
      newfeedLimit: NewsFeed_LIMIT,
    });
    if (hasMore) {
      console.log("there is hasMore newsfeed");
      recentPosts.pop();
    }
  } catch (error) {
    console.log("Recent Post Error - ", error);
  }
  return { recentPosts, hasMore };
}
export async function fetchMyPosts(
  uid: string | string[],
  isFriend: boolean,
  isBlocked: boolean,
  token: DecodedIdToken
) {
  let mypostQuery;
  if (isFriend) {
    mypostQuery = DescQuery(
      getPath("posts", { uid: String(uid) }),
      MYPOST_LIMIT + 1,
      where("visibility", "in", ["Friend", "Public"])
    );
  } else if (uid === token.uid) {
    mypostQuery = DescQuery(
      getPath("posts", { uid: String(uid) }),
      MYPOST_LIMIT + 1
    );
  } else {
    mypostQuery = DescQuery(
      getPath("posts", { uid: String(uid) }),
      MYPOST_LIMIT + 1,
      where("visibility", "==", "Public")
    );
  }
  let hasMore = false;
  const myPost = isBlocked
    ? null
    : await getPostWithMoreInfo(token.uid, mypostQuery);
  // myPost?.shift();
  hasMore = (myPost?.length ?? 0) > MYPOST_LIMIT;
  if (hasMore) {
    myPost?.pop();
  }
  return myPost;
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
  } catch (error: any) {
    alert("Updating Post Failed !" + error.message);
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
        const { author: shareAuthorId, post: sharePostId } = share;
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
        `${getCollectionPath.posts({ uid: author })}/${post}`
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
  } catch (error: any) {
    alert("Delete Failed !" + error.message);
  }
}
export async function likePost(
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
export async function fetchLikedUsers(post: Post) {
  const likeRef = DescQuery(
    getPath("likes", {
      authorId: String(post.authorId),
      postId: String(post.id),
    })
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
