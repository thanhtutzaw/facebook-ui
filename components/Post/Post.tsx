import styles from "./Post.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faComment,
  faShare,
} from "@fortawesome/free-solid-svg-icons";

export default function Post(props: any) {
  const { text } = props;
  return (
    <>
      <div className={styles.post}>
        <div className={styles.postContainer}>
          <div className={styles.postHeader}>
            <img className={styles.profile}></img>
            <div>
              <p>Name</p>
              <p>Time</p>
            </div>
          </div>
          <p>{text}</p>
        </div>
        <div className={styles.postAction}>
          <button>
            <FontAwesomeIcon icon={faThumbsUp} />
          </button>
          <button>
            <FontAwesomeIcon icon={faComment} />
          </button>
          <button>
            <FontAwesomeIcon icon={faShare} />
          </button>
        </div>
      </div>
    </>
  );
}
