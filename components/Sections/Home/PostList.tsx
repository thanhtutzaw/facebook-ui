import { User, getAuth } from "firebase/auth";
import { Post as PostType } from "../../../types/interfaces";
import Post from "../../Post";
import { memo, useContext, useEffect } from "react";
import { PageContext, PageProps } from "../../../context/PageContext";
import s from '../../Post/index.module.scss'
export const PostList = memo(
  (props: {
    preventNavigate?: boolean;
    selectMode?: boolean;
    posts: PostType[];
    tabIndex?: number;
    profile?:any;
    auth?: User;
  }) => {
    console.log("postList is rendering");

    const {profile, preventNavigate, auth, selectMode, posts, tabIndex } = props;
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
        <p
          style={{
            textAlign: "center",
            userSelect: "none",
          }}
        >
          {posts?.length === 0 ? "Empty Post" : "No more posts"}
        </p>
      </>
    );
  }
);
PostList.displayName = "PostList";
