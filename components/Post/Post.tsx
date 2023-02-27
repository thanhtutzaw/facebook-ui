import styles from "./Post.module.css";
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
}
export default function Post({ post }: Props) {
  const { id, text } = post;
  const [Bounce, setBounce] = useState(false);
  return (
    <>
      <div className={styles.post} key={id}>
        {/* <div className={styles.postContainer}> */}
        <div className={styles.postHeader}>
          {/* <img className={styles.profile}></img> */}
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
            <p>Name</p>
            <p>Time</p>
          </div>
        </div>
        <p>{text}</p>
        <div
          className={styles.postAction}
          onMouseEnter={() => setBounce(true)}
          onMouseLeave={() => setBounce(false)}
        >
          <button>
            <FontAwesomeIcon bounce={Bounce} icon={faThumbsUp} />
            <p>Like</p>
          </button>
          <button>
            <FontAwesomeIcon icon={faComment} bounce={Bounce} />

            <p>Comment</p>
          </button>
          <button>
            <FontAwesomeIcon icon={faShare} bounce={Bounce} />
            <p>Share</p>
          </button>
        </div>
      </div>
      {/* </div> */}
    </>
  );
}
