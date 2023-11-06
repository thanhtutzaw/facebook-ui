import { useEffect, useRef, useState } from "react";
import { Post } from "../../types/interfaces";
import Spinner from "../Spinner";
import CommentItem from "./CommentItem";
import s from "./index.module.scss";

export default function Comment(props: {
  setComments: Function;
  hasMore: boolean;
  commentEnd?: boolean;
  commentLoading?: boolean;
  uid: string;
  comments: Post["comments"] | [];
  post: Post;
}) {
  const { setComments, hasMore, commentEnd, post, comments, uid } = props;

  const [client, setclient] = useState(false);

  const [editToggle, seteditToggle] = useState("");
  useEffect(() => {
    setclient(true);
  }, []);
  const [toggleCommentMenu, settoggleCommentMenu] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  if (comments?.length === 0) return <></>;
  return (
    <>
      <ul className={s.container}>
        {comments?.map((comment) => (
          <CommentItem
            menuRef={menuRef}
            toggleCommentMenu={toggleCommentMenu}
            settoggleCommentMenu={settoggleCommentMenu}
            post={post}
            editToggle={editToggle}
            seteditToggle={seteditToggle}
            client={client}
            uid={uid}
            key={comment.id}
            comment={comment}
            comments={comments}
            setComments={setComments}
          />
        ))}
      </ul>
      {!hasMore && !commentEnd ? null : hasMore && !commentEnd && <Spinner />}
    </>
  );
}
