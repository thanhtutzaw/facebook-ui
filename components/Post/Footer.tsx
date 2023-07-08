import {
  faComment,
  faShare,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { StyleHTMLAttributes } from "react";
import styles from "./index.module.scss";

export function Footer(
  props: {
    tabIndex?: number;
  } & StyleHTMLAttributes<HTMLDivElement>
) {
  const { tabIndex } = props;
  return (
    <div {...props} className={styles.action}>
      <button tabIndex={tabIndex}>
        <FontAwesomeIcon icon={faThumbsUp} />
        <p>Like</p>
      </button>
      <button tabIndex={tabIndex}>
        <FontAwesomeIcon icon={faComment} />
        <p>Comment</p>
      </button>
      <button tabIndex={tabIndex}>
        <FontAwesomeIcon icon={faShare} />
        <p>Share</p>
      </button>
    </div>
  );
}
