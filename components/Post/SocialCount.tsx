import { useState } from "react";
import { Post } from "../../types/interfaces";
import s from "./index.module.scss";

export function SocialCount(props: { post: Post; likeCount: number }) {
  const { post, likeCount } = props;
  const [reaction, setReaction] = useState({
    like: ["1a", "2d"],
  });
  const shareCount = post.shares?.length ?? 0;
  const commentCount = parseInt(
    (post.commentCount?.toString() as string) ?? 0
  ) as number;
  return (
    <>
      {/* {JSON.stringify(post.likeCount)} */}

      {shareCount || likeCount || commentCount ? (
        <div className={s.socialCount}>
          {likeCount !== 0 && likeCount && (
            <p
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {likeCount} {likeCount <= 1 ? "like" : "likes"}
            </p>
          )}
          {!commentCount || (
            <p>
              {commentCount} {commentCount <= 1 ? "comment" : "comments"}
            </p>
          )}
          {post.shares && shareCount !== 0 && (
            <p
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {shareCount} {shareCount <= 1 ? "share" : "shares"}
            </p>
          )}
        </div>
      ) : null}
    </>
  );
}
