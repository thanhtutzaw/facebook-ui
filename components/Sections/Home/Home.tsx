import styles from "../../../styles/Home.module.css";
import Story from "./Story";
import Newfeed from "./Newfeed";

export function Home({ posts }) {
  return (
    <div id="/" className={styles.home}>
      <Story />
      <Newfeed posts={posts} />
    </div>
  );
}
