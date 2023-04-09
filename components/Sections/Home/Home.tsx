import styles from "../../../styles/Home.module.scss";
import Story from "./Story";
import Newfeed from "./Newfeed";
import { Post } from "../../../types/interfaces";
import { InferGetServerSidePropsType } from "next";
import { getServerSideProps } from "../../../pages";
import { useEffect } from "react";
// export interface Post {
//   text: String;
// }
type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
export function Home(props: Props) {
  const { posts, email } = props;
  useEffect(() => { 
    console.log("Home is Rendering");
  }, []);

  return (
    <div id="/" className={styles.home}>
      <Story />
      <Newfeed email={email} posts={posts} />
    </div>
  );
}
