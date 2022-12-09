import Friend from "../pages/friend";
import styles from "../styles/Home.module.css";
import { Story, Posts } from "../pages/index";
import Profile from "../pages/profile";
import Watch from "../pages/watch";
import Menu from "../pages/menu";
import Noti from "../pages/noti";

export function Content() {
  return (
    <div id="content" className={styles.content}>
      <div className={styles.home}>
        <Story />
        <Posts />
      </div>
      <Friend />
      <Profile />
      <Watch />
      <Noti />
      <Menu />
    </div>
  );
}
