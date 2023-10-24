import { doc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  JSONTimestampToDate,
  db,
  getCollectionPath,
  getPath,
} from "../../lib/firebase";
import { Comment, Post } from "../../types/interfaces";
import AuthorInfo from "../Post/AuthorInfo";
import Spinner from "../Spinner";
import s from "./index.module.scss";

export default function Comment(props: {
  hasMore: boolean;
  commentEnd?: boolean;
  commentLoading?: boolean;
  uid: string;
  comments: Post["comments"] | [];
  post: Post;
}) {
  const { hasMore, commentEnd, commentLoading, post, comments, uid } = props;
  const { authorId, id: postId } = post;
  const postRef = doc(db, `${getPath("posts", { uid })}/${postId}`);
  const router = useRouter();
  const [client, setclient] = useState(false);
  useEffect(() => {
    setclient(true);
  }, []);
  if (comments?.length === 0) return <></>;
  return (
    <>
      <ul className={s.container}>
        {comments?.map((c) => (
          <Card client={client} uid={uid} key={c.id} c={c} />
        ))}
        {/* {!commentLoading && !commentEnd ? null : commentLoading ? (
          <Spinner style={{ marginTop: "0" }} />
        ) : (
          <></>
        )} */}
      </ul>
      {!hasMore && !commentEnd && (
        <p
          style={{
            textAlign: "center",
            userSelect: "none",
          }}
        >
          {comments?.length !== 0 && "No more Comment"}
        </p>
      )}
      {!hasMore && !commentEnd ? null : hasMore && !commentEnd ? (
        <Spinner style={{ marginTop: "0" }} />
      ) : (
        <></>
      )}
    </>
  );
  function Card(props: { client: boolean; uid: string; c: Comment }) {
    const { client, uid, c } = props;
    const { text, createdAt } = c;
    const commentRef = doc(
      db,
      `${getCollectionPath.comments({
        authorId: String(post.authorId),
        postId: String(post.id),
      })}/${c.id}`
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
          }}
        >
          <p className={s.text}>{text}</p>
          <div className={s.actions}>
            <p suppressHydrationWarning>
              {JSONTimestampToDate(createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
            <button className={s.replayBtn}>Reply</button>
          </div>
        </AuthorInfo>
      </li>
    );
  }
}
