import { useAppContext } from "@/context/AppContext";
import { useNewsFeedContext } from "@/context/NewsFeedContext";
import { app } from "@/lib/firebase";
import styles from "@/styles/Home.module.scss";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import { memo, useEffect, useState } from "react";
import PostList from "./PostList";
// type NewfeedProps = InferGetServerSidePropsType<typeof getServerSideProps> & {
// };
function Newfeed(props: {tabIndex: number }) {
  const { tabIndex,  } = props;
  const { posts, newsFeedPost, deletePost, postEnd, hasMore } =
    useNewsFeedContext();
  const [user, setuser] = useState<User | null>(null);
  useEffect(() => {
    const auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      setuser(user);
    });
  }, []);
  return (
    <div className={styles.postContainer}>
      <PostList
        deletePost={deletePost}
        postLoading={hasMore}
        postEnd={postEnd}
        auth={user!}
        posts={newsFeedPost.length === 0 ? posts : newsFeedPost}
        tabIndex={tabIndex!}
      />
    </div>
  );
}
export default memo(Newfeed);
