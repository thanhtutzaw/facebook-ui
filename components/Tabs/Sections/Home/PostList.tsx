
import Post from "@/components/Post";
import s from "@/components/Post/index.module.scss";
import Spinner from "@/components/Spinner";
import { Post as PostType } from "@/types/interfaces";
import { User } from "firebase/auth";
import { memo, useState } from "react";
export const PostList = memo(
  (props: {
    updatePost?: Function;
    preventNavigate?: boolean;
    selectMode?: boolean;
    posts: PostType[];
    tabIndex?: number;
    profile: any;
    auth?: User;
    postLoading?: boolean;
    postEnd?: boolean;
  }) => {
const [toggleMenu, settoggleMenu] = useState("");
    const {
      updatePost,
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
              updatePost={updatePost}
              selectMode={selectMode}
              preventNavigate={preventNavigate}
              auth={auth!}
              tabIndex={tabIndex}
              key={post?.id ?? ""}
              post={post}
            />
          ))}
        </div>
        {!postLoading && !postEnd && (
          <p
            style={{
              textAlign: "center",
              userSelect: "none",
            }}
          >
            {posts?.length === 0 ? "Empty Post" : "No more posts"}
          </p>
        )}
        {!postLoading && !postEnd ? null : postLoading && !postEnd ? (
          <Spinner />
        ) : (
          <p
            style={{
              textAlign: "center",
              userSelect: "none",
            }}
          >
            {posts?.length === 0 ? "Empty Post" : "No more posts"}
          </p>
        )}
      </>
    );
  }
);
PostList.displayName = "PostList";
