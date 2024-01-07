import Post from "@/components/Post";
import s from "@/components/Post/index.module.scss";
import Spinner from "@/components/Spinner";
import { Post as PostType } from "@/types/interfaces";
import { User } from "firebase/auth";
import { memo, useState } from "react";
function PostList(props: {
  deletePost?: Function;
  preventNavigate?: boolean;
  selectMode?: boolean;
  posts: PostType[];
  tabIndex?: number;
  auth?: User | null;
  postLoading?: boolean;
  postEnd?: boolean;
}) {
  const [toggleMenu, settoggleMenu] = useState("");
  const {
    deletePost,
    postLoading,
    postEnd,
    preventNavigate,
    auth,
    selectMode,
    posts,
    tabIndex,
  } = props;
  return (
    <>
      <div
        className={s.container}
        style={{
          willChange: "margin",
          marginInline: selectMode
            ? "calc(var(--padding-inline) * 2)"
            : "initial",
          transition: "margin .35s ease-in-out",
          backgroundColor: "#dadada",
        }}
      >
        {posts?.map((post: PostType) => (
          <Post
            toggleMenu={toggleMenu}
            settoggleMenu={settoggleMenu}
            deletePost={deletePost}
            selectMode={selectMode}
            preventNavigate={preventNavigate}
            auth={auth}
            tabIndex={tabIndex}
            key={post?.id ?? ""}
            post={post}
          />
        ))}
      </div>
      {!postLoading && !postEnd && (
        <p className="text-center select-none">
          {posts?.length === 0 ? "Empty Post" : "No more posts"}
        </p>
      )}
      {!postLoading && !postEnd ? (
        <></>
      ) : postLoading && !postEnd ? (
        <Spinner />
      ) : (
        <p className="text-center select-none">
          {posts?.length === 0 ? "Empty Post" : "No more posts"}
        </p>
      )}
    </>
  );
}
export default memo(PostList);
