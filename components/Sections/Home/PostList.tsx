import { User } from "firebase/auth";
import { memo } from "react";
import { Post as PostType } from "../../../types/interfaces";
import Post from "../../Post";
import s from "../../Post/index.module.scss";
import Spinner from "../../Spinner";
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
    console.log("postList is rendering");

    const {
      updatePost,
      postLoading,
      postEnd,
      profile,
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
            marginInline: selectMode ? "2rem" : "initial",
            transition: "margin .35s ease-in-out",
            backgroundColor: "#dadada",
          }}
        >
          {posts?.map((post: PostType) => (
            <Post
              updatePost={updatePost}
              selectMode={selectMode}
              preventNavigate={preventNavigate}
              profile={profile}
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
        {!postLoading && !postEnd ? null : postLoading ? (
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
