import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Post.module.scss";
import {
  faThumbsUp,
  faComment,
  faShare,
} from "@fortawesome/free-solid-svg-icons";

export function Footer(props: { tabIndex?: number; Bounce?: boolean }) {
  const { tabIndex, Bounce } = props;
  return (
    <div className={styles.action}>
      <button tabIndex={tabIndex}>
        <FontAwesomeIcon bounce={Bounce} icon={faThumbsUp} />
        <p>Like</p>
      </button>
      <button tabIndex={tabIndex}>
        <FontAwesomeIcon icon={faComment} bounce={Bounce} />
        <p>Comment</p>
      </button>
      <button tabIndex={tabIndex}>
        <FontAwesomeIcon icon={faShare} bounce={Bounce} />
        <p>Share</p>
      </button>
    </div>
  );
}
