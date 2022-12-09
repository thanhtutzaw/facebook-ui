import Friend from "../pages/friend";
import styles from "../styles/Home.module.css";
import { Story, Posts } from "../pages/index";
import Profile from "../pages/profile";

export function Content() {
  return (
    <div className={styles.content}>
      <div className={styles.home}>
        <Story />
        <Posts />
      </div>
      <Friend />
      <Profile />
    </div>
  );
}
