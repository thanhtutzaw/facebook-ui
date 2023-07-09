import { User, getAuth } from "firebase/auth";
import { Post as PostType } from "../../../types/interfaces";
import Post from "../../Post";
import { app } from "../../../lib/firebase";

export function PostList(props: {
  active?: boolean;
  profile?:any;
  posts: PostType[];
  tabIndex?: number;
  auth?: User;
}) {
  const { profile ,auth, active, posts, tabIndex } = props;
  // console.log("calling in postlist" + auth?.currentUser?.uid);
  return (
    <>
      <div
        style={{
          willChange: "margin",
          marginInline: active ? "2rem" : "initial",
          transition: "margin .35s ease-in-out",
          backgroundColor: "#dadada",
        }}
      >
        {posts?.map((post: PostType) => (
          <Post profile={profile} auth={auth!} tabIndex={tabIndex} key={post.id} post={post} />
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
