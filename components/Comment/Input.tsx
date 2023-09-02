import { faArrowAltCircleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Timestamp,
  collection,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useState } from "react";
import { commentDateToJSON, db } from "../../lib/firebase";
import { addComment } from "../../lib/firestore/comment";
import { sendAppNoti } from "../../lib/firestore/notifications";
import { Post, account } from "../../types/interfaces";
import s from "./index.module.scss";
import Image from "next/image";
export default function CommentInput(props: {
  setlimitedComments: any;
  uid?: string;
  postId: string;
  authorId: string;
  post?: Post;
  profile?: account["profile"];
}) {
  const { setlimitedComments, profile, post, uid, authorId, postId } = props;
  const [text, settext] = useState("");
  const commentRef = doc(
    collection(db, `users/${authorId}/posts/${postId}/comments`)
  );
  const router = useRouter();
  const [addLoading, setaddLoading] = useState(false);
  const postRef = doc(db, `users/${authorId}/posts/${postId}`);
  const previousCommentCount = post?.comments.length ?? 0;
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!uid) {
          alert("User not Found ! Sign in and Try again !");
          throw Error;
        }
        if (text === "") return;
        try {
          setaddLoading(true);
          const addedComment = await addComment(
            commentRef,
            uid,
            text,
            postRef,
            previousCommentCount
          );
          // console.log(`${authorId}/${post?.id}/#comment-${commentRef.id}`);
          await sendAppNoti(
            uid,
            post?.authorId.toString()!,
            profile!,
            "comment",
            `${authorId}/${post?.id}/#comment-${commentRef.id}`,
            text
          );
          // const date = addedComment.createdAt;
          // const comment = {
          //   ...addedComment,
          //   // createdAt: {new Timestamp()}
          // };
          // const date = new Timestamp(
          //   addedComment.createdAt.nanoseconds,
          //   addedComment.createdAt.seconds
          // );
          // setlimitedComments([
          //   ...post?.comments!,
          //   commentDateToJSON(addedComment),
          // ]);
          // setlimitedComments(post?.comments);
          // console.log(addedComment.createdAt);
          // console.log(new Date(Date.now()).getUTCDate());
          router.replace(router.asPath, undefined, { scroll: false });
          settext("");
          setaddLoading(false);
        } catch (error: any) {
          console.log(error);
          alert(error.message);
          setaddLoading(false);
        }
      }}
      className={s.input}
    >
      <Image
        className={s.profile}
        width={200}
        height={200}
        priority
        alt={profile?.firstName ?? "Unknow"}
        src={(profile?.photoURL as string) ?? ""}
        // alt={currentUser?.displayName ?? "Unknow User"}
        // src={currentUser?.photoURL ?? ""}
      />
      <input
        onChange={(e) => {
          settext(e.target.value);
        }}
        value={text}
        aria-label="Add Comment"
        placeholder="Add comment"
        type="text"
      />
      <button
        aria-label="Submit Comment"
        tabIndex={1}
        type="submit"
        disabled={addLoading}
      >
        <FontAwesomeIcon icon={faArrowAltCircleUp} />
      </button>
    </form>
  );
}
