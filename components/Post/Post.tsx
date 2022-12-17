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
        {/* <div className={styles.postContainer}> */}
          <div className={styles.postHeader}>
            <img className={styles.profile}></img>
            <div>
              <p>Name</p>
              <p>Time</p>
            </div>
          </div>
          <p>{text}</p>
        <div className={styles.postAction}>
          <button>
            <FontAwesomeIcon icon={faThumbsUp} />
            <p>Like</p>
          </button>
          <button>
            <FontAwesomeIcon icon={faComment} />
            <p>Comment</p>
          </button>
          <button>
            <FontAwesomeIcon icon={faShare} />
            <p>Share</p>
          </button>
        </div>
        </div>
      {/* </div> */}
    </>
  );
}
