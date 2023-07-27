import { InferGetServerSidePropsType } from "next";
import { useCallback, useContext, useEffect, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import { getServerSideProps } from "../../../pages";
import styles from "../../../styles/Home.module.scss";
import { Props } from "../../../types/interfaces";
import { PostList } from "./PostList";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../../lib/firebase";
// type NewfeedProps = InferGetServerSidePropsType<typeof getServerSideProps> & {
//   tabIndex: number;
// };
type NewfeedProps = InferGetServerSidePropsType<typeof getServerSideProps> & {
  tabIndex: number;
};
export default function Newfeed(props: NewfeedProps) {
  const { tabIndex } = props;
  const { updatePost ,setlimitedPosts, getMorePosts, posts, postLoading, postEnd } =
    useContext(AppContext) as Props;
  const [user, setuser] = useState<User | null>(null);

  // const { id, authorId, text, visibility, createdAt } = posts;
  useEffect(() => {
    const auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      // console.log(user);
      setuser(user);
    });
  }, []);
  
  return (
    <div className={styles.postContainer}>
      <PostList
        updatePost={updatePost}
        postLoading={postLoading}
        postEnd={postEnd}
        auth={user!}
        posts={posts!}
        tabIndex={tabIndex!}
      />
    </div>
  );
}
