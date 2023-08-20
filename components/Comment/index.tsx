import { Timestamp, doc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { Comment, Post } from "../../types/interfaces";
import AuthorInfo from "../Post/AuthorInfo";
import s from "./index.module.scss";
import Spinner from "../Spinner";

export default function Comment(props: {
  commentEnd?: boolean;
  commentLoading?: boolean;
  uid: string;
  comments: Post["comments"] | [];
  post: Post;
}) {
  const { commentEnd, commentLoading, post, comments, uid } = props;
  const { authorId, id: postId } = post;
  const postRef = doc(db, `users/${authorId}/posts/${postId}`);
  const router = useRouter();
  const [client, setclient] = useState(false);
  useEffect(() => {
    setclient(true);
  }, []);

  return (
    <ul className={s.container}>
      {comments?.map((c) => (
        <Card client={client} uid={uid} key={c.id} c={c} />
      ))}
      {/* {commentLoading && !commentEnd && <Spinner style={{ margin: "0" }} />} */}

      {!commentLoading && !commentEnd ? null : commentLoading ? (
        <Spinner style={{ margin: "0" }} />
      ) : (
        <></>
      )}
    </ul>
  );
  function Card(props: { client: boolean; uid: string; c: Comment }) {
    const { client, uid, c } = props;
    const { text, createdAt } = c;
    const commentRef = doc(
      db,
      `users/${post.authorId}/posts/${post.id}/comments/${c.id}`
    );

    return (
      <li className={s.item} id={`comment-${c.id}`}>
        <AuthorInfo
          postRef={postRef}
          commentRef={commentRef}
          isAdmin={uid === c.authorId}
          comment={c}
          style={{
            backgroundColor:
              client && router.asPath.match(c.id?.toString()!)
                ? "#e9f3ff"
                : "initial",
            // paddingBottom: "20px !important",
          }}
        >
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
