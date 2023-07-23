import { User, getAuth } from "firebase/auth";
import { Post as PostType } from "../../../types/interfaces";
import Post from "../../Post";
import { memo, useContext, useEffect } from "react";
import { PageContext, PageProps } from "../../../context/PageContext";
import s from "../../Post/index.module.scss";
export const PostList = memo(
  (props: {
    getMorePosts?: Function;
    preventNavigate?: boolean;
    selectMode?: boolean;
    posts: PostType[];
    tabIndex?: number;
    profile?: any;
    auth?: User;
    postLoading?: boolean;
    postEnd?: boolean;
  }) => {
    console.log("postList is rendering");

    const {
      getMorePosts,
      postLoading,
      postEnd,
      profile,
      preventNavigate,
      auth,
      selectMode,
      posts,
      tabIndex,
    } = props;
    const { shareAction, setshareAction } = useContext(
      PageContext
    ) as PageProps;

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
              selectMode={selectMode}
              preventNavigate={preventNavigate}
              profile={profile}
              auth={auth!}
              tabIndex={tabIndex}
              key={post.id}
              post={post}
            />
          ))}
        </div>

        {!postLoading && !postEnd ? (
          <button
            className={s.loadMore}
            onClick={async () => {
              await getMorePosts?.();
            }}
          >
            Load more
          </button>
        ) : postLoading ? (
          <p>Loading...</p>
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
