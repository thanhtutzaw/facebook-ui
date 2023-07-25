import { collection, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { Post } from "../../types/interfaces";
import s from "./index.module.scss";

export function SocialCount(props: { post: Post; likeCount: number }) {
  const { post, likeCount } = props;
  const [reaction, setReaction] = useState({
    like: ["1a", "2d"],
  });
  // useEffect(() => {
  //   async function getLike() {
  //     const postRef = doc(db, `users/${post.authorId}/posts/${post.id}`);
  //     const likeRef = collection(postRef, "likes");
  //     const likeDoc = await getDocs(likeRef);
  //     if (!likeDoc.empty) {
  //       console.log(likeDoc.docs.length);
  //       setlike(likeDoc.docs.length);
  //       return likeDoc.docs.length;
  //     } else {
  //       setlike(0);
  //       console.log("like empty");
  //     }
  //   }
  //   getLike();
  // }, [post.authorId, post.id]);

  // if(likeDoc)
  // const like = post.like?.length ?? 0;
  // const reactionCount = reaction.like.length ?? 0;
  // const reactionCount = posts.likes.length;
  const shareCount = post?.sharers?.length ?? 0;
  return (
    <>
      {shareCount || likeCount ? (
        <div className={s.socialCount}>
          {likeCount !== 0 && post?.like && (
            <p className={s.shareCount}>
              {/* {post.like?.length} */}
              {likeCount} {likeCount <= 1 ? "like" : "likes"}
              {/* {JSON.stringify(post.like)} */}
            </p>
          )}
          {/* {likeCount !== 0 && post?.like && (
        
      )} */}
          {post.sharers && (
            <p style={{ marginLeft: "auto" }} className={s.shareCount}>
              {shareCount} {shareCount <= 1 ? "share" : "shares"}
            </p>
          )}
        </div>
      ) : null}
    </>
  );
}
