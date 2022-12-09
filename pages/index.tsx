import styles from "../styles/Home.module.css";
import { Content } from "../components/Content";

export function Story() {
  return <div className={styles.storyContainer}>Story</div>;
}
export function Posts() {
  return <div className={styles.postContainer}>Posts</div>;
}

export default function Home() {
  return (
    <>
      <Content />
    </>
  );
}
