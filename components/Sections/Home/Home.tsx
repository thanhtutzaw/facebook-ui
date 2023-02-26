import styles from "../../../styles/Home.module.css";
import Story from "./Story";
import Newfeed from "./Newfeed";
import { Post } from "../../../types/interfaces";
import { InferGetServerSidePropsType } from "next";
import { getServerSideProps } from "../../../pages";
// export interface Post {
//   text: String;
// }
type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
export function Home(props: Props) {
  const { posts, email } = props;
  return (
    <div id="/" className={styles.home}>
      <Story />
      <Newfeed email={email} posts={posts} />
    </div>
  );
}
