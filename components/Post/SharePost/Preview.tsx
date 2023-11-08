import Link from "next/link";
import { Router } from "next/router";
import { Post as PostType } from "../../../types/interfaces";
import PostFallback from "../Fallback";
import s from "@/components/Post/index.module.scss";
import Post from "..";

export function SharePreview(props: {
  selectMode?: boolean;
  query?: Router["query"];
  post: PostType;
}) {
  const { selectMode, query, post } = props;
  const sharePost = post.sharePost?.post!;
  const url = query
    ? `${query.author}/${query.id}`
    : `/${sharePost?.authorId}/${sharePost?.id}`;
  if (post?.sharePost?.id && post.sharePost?.post === null)
    return <PostFallback post={post} />;
  return (
    <>
      {post?.sharePost?.post || query ? (
        <Link
          onClick={(e) => {
            e.stopPropagation();
          }}
          style={{ pointerEvents: selectMode ? "none" : "initial" }}
          tabIndex={-1}
          href={url}
          className={s.sharePreview}
        >
          <Post shareMode={true} post={query ? post : post?.sharePost?.post!} />
        </Link>
      ) : null}
    </>
  );
}
