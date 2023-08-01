import { Post as PostType } from "../../types/interfaces";
import Link from "next/link";
import Post from ".";
import SharePostFallback from "./SharePostFallback";
import { Router } from "next/router";
import s from "../../components/Post/index.module.scss";
export function SharePreview(props: {
  selectMode?: boolean;
  post: PostType;
  query?: Router["query"];
}) {
  const { selectMode, post, query } = props;
  // const author , id = query;
  const url = query
    ? `${query.author}/${query.id}`
    : `/${post?.sharePost?.post?.authorId}/${post?.sharePost?.post?.id}`;
  if (post?.sharePost?.id && post.sharePost?.post === null)
    return <SharePostFallback />;
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
          prefetch={false}
          className={s.sharePreview}
        >
          <Post shareMode={true} post={query ? post : post?.sharePost?.post!} />
        </Link>
      ) : null}
    </>
  );
}
