import { Timestamp, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Comment, Post } from "../../types/interfaces";
import AuthorInfo from "../Post/AuthorInfo";
import s from "./index.module.scss";
export default function Comment(props: {
  isAdmin: boolean;
  comments: Post["comments"] | [];
  post: Post;
}) {
  const { post, comments, isAdmin } = props;
  return (
    <ul className={s.container}>
      {comments?.map((c) => (
        <Card isAdmin={isAdmin} key={c.id} c={c} />
      ))}
    </ul>
  );
  function Card(props: { isAdmin: boolean; c: Comment }) {
    const { isAdmin, c } = props;
    const { text, createdAt } = c;
    const commentRef = doc(
      db,
      `users/${post.authorId}/posts/${post.id}/comments/${c.id}`
    );
    return (
      <li className={s.item}>
        <AuthorInfo commentRef={commentRef} isAdmin={isAdmin} comment={c}>
          <p className={s.text}>{text}</p>
          {/* <Link href={"/" + authorId.toString()}>
        </Link> */}
          <div className={s.actions}>
            <p suppressHydrationWarning>
              {new Timestamp(createdAt?.seconds, createdAt?.nanoseconds)
                .toDate()
                .toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
            </p>
            {/* {createdAt} */}
            {/* <button>
              <FontAwesomeIcon icon={faThumbsUp} />
              Like
            </button> */}
            <button className={s.replayBtn}>
              {/* <FontAwesomeIcon icon={faShare} /> */}
              Reply
            </button>
          </div>
        </AuthorInfo>
      </li>
    );
  }
}
