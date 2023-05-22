import styles from "./Post.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faComment,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { Post as PostType, Props } from "../../types/interfaces";
import { useState, useContext } from "react";
// import { Post } from "../../types/interfaces";
// type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
// interface Props {
//   post: Post;
// }
interface PostProps {
  post: PostType;
  tabIndex: number;
}
export default function Post({ post, tabIndex }: PostProps) {
  const { authorId, id, text } = post;
  const [Bounce, setBounce] = useState(false);
  return (
    <div className={styles.post} key={id}>
      <div className={styles.header}>
        <Image
          className={styles.profile}
          alt={text}
          width={200}
          height={200}
          style={{ objectFit: "cover" }}
          src={
            // "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
            authorId === "rEvJE0sb1yVJxfHTbtn915TSfqJ2"
              ? "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
              : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
          }
          // src={
          //   "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
          // }
        />
        <div>
          <p>
            {authorId === "rEvJE0sb1yVJxfHTbtn915TSfqJ2"
              ? "Peter 1"
              : "Other User"}
          </p>
          {/* <p>{}</p> */}
          <p>Time</p>
        </div>
      </div>
      {/* <p>author_Id: {authorId}</p> */}
      {/* <p>post_id: {id}</p> */}
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
