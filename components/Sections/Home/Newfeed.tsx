import { InferGetServerSidePropsType } from "next";
import { useContext, useEffect, useState } from "react";
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
  const { active, posts, profile } = useContext(AppContext) as Props;
  // const user = getAuth(app).currentUser;
  const [user, setuser] = useState<User | null>(null);

  // const { id, authorId, text, visibility, createdAt } = posts;
  // console.log(user?.email);
  // console.log(user?.uid);
  useEffect(() => {
    const auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      // console.log(user);
      setuser(user);
    });
  }, []);

  return (
    <div className={styles.postContainer}>
      {active === "/" && (
        <PostList
          profile={profile}
          auth={user!}
          posts={posts!}
          tabIndex={tabIndex!}
        />
      )}
    </div>
  );
}
