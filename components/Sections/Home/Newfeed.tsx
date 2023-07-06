import { InferGetServerSidePropsType } from "next";
import { useContext } from "react";
import { AppContext } from "../../../context/AppContext";
import { getServerSideProps } from "../../../pages";
import styles from "../../../styles/Home.module.scss";
import { Post as PostType, Props } from "../../../types/interfaces";
import Post from "../../Post";
// type NewfeedProps = InferGetServerSidePropsType<typeof getServerSideProps> & {
//   tabIndex: number;
// };
type NewfeedProps = InferGetServerSidePropsType<typeof getServerSideProps> & {
  tabIndex: number;
};
export default function Newfeed(props: NewfeedProps) {
  const { tabIndex } = props;
  const { posts } = useContext(AppContext) as Props;
  // const { id, authorId, text, visibility, createdAt } = posts;

  return (
    <div className={styles.postContainer}>
      {posts?.map((post: PostType) => (
        <Post tabIndex={tabIndex} key={post.id} post={post} />
      ))}
      <p style={{ textAlign: "center", userSelect: "none" }}>
        {posts?.length === 0 ? "Empty Post" : "No more posts"}
      </p>
    </div>
  );
}
