import { Post as PostType } from "../../types/interfaces";
import Link from "next/link";
import Post from ".";
import SharePostFallback from "./SharePostFallback";
import { Router } from "next/router";
import s from "../../components/Post/index.module.scss";
export function SharePreview(props: {
  post: PostType;
  query?: Router["query"];
}) {
  const { post, query } = props;
  // const author , id = query;
  const url = query
    ? `${query.author}/${query.id}`
    : `${post?.sharePost?.post?.authorId}/${post?.sharePost?.post?.id}`;
  if (post?.sharePost?.id && post.sharePost?.post === null)
    return <SharePostFallback />;
  return (
    <>
      {post?.sharePost?.post || query ? (
        <Link
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
          }}
          href={url}
          className={s.sharePreview}
        >
          <Post shareMode={true} post={query ? post : post?.sharePost?.post!} />
        </Link>
      ) : (
        <></>
      )}
    </>
  );
}
