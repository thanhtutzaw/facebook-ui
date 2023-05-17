import styles from "./Post.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faComment,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { Post as PostType } from "../../types/interfaces";
import { useState } from "react";
// import { Post } from "../../types/interfaces";
// type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
// interface Props {
//   post: Post;
// }
interface Props {
  post: PostType;
  email: string | null | undefined;
  tabIndex: number;
}
export default function Post({ post, email, tabIndex }: Props) {
  const { id, text } = post;
  const [Bounce, setBounce] = useState(false);
  return (
    <div className={styles.post} key={id}>
      <div className={styles.header}>
        <Image
          className={styles.profile}
          alt={text}
          width={50}
          height={50}
          src={
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
          }
        />
        <div>
          <p>{"Post Author"}</p>
          {/* <p>{}</p> */}
          <p>Time</p>
        </div>
      </div>
      <p>{text}</p>
      <div
        className={styles.action}
        // onPointerEnter={() => setBounce(true)}
        // onPointerLeave={() => setBounce(false)}
      >
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
    </div>
  );
}
