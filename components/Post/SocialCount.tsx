import { collection, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { Post } from "../../types/interfaces";
import s from "./index.module.scss";

export function SocialCount(props: { post: Post }) {
  const { post } = props;
  const [reaction, setReaction] = useState({
    like: ["1a", "2d"],
  });
  // const [like, setlike] = useState(0);
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
  const like = post.like?.length ?? 0;
  // const reactionCount = reaction.like.length ?? 0;
  // const reactionCount = posts.likes.length;
  const shareCount = post?.sharers?.length ?? 0;
  return (
    <div className={s.socialCount}>
      {like !== 0 && (
        <p className={s.shareCount}>
          {like} {like <= 1 ? "like" : "likes"}
        </p>
      )}
      {post.sharers && (
        <p className={s.shareCount}>
          {shareCount} {shareCount <= 1 ? "share" : "shares"}
        </p>
      )}
    </div>
  );
}
