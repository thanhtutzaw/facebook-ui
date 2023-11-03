import useEscape from "@/hooks/useEscape";
import { doc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
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
import { PageContext, PageProps } from "@/context/PageContext";
import { AnimatePresence, motion } from "framer-motion";
import CommentItem from "./CommentItem";

export default function Comment(props: {
  hasMore: boolean;
  commentEnd?: boolean;
  commentLoading?: boolean;
  uid: string;
  comments: Post["comments"] | [];
  post: Post;
}) {
  const { hasMore, commentEnd,  post, comments, uid } = props;

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
          />
        ))}
      </ul>
      {!hasMore && !commentEnd ? null : hasMore && !commentEnd && <Spinner />}
    </>
  );
  
}
