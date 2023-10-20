import { faArrowAltCircleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { collection, doc } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import { db } from "../../lib/firebase";
import { addComment } from "../../lib/firestore/comment";
import { sendAppNoti } from "../../lib/firestore/notifications";
import { Post } from "../../types/interfaces";
import s from "./index.module.scss";
export default function CommentInput(props: {
  setlimitedComments: any;
  uid?: string;
  postId: string;
  authorId: string;
  post?: Post;
  // profile?: account["profile"];
}) {
  const { currentUser } = useContext(PageContext) as PageProps;
  const { setlimitedComments, post, uid, authorId, postId } = props;
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
          await sendAppNoti({
            uid,
            receiptId: post?.authorId.toString()!,
            profile: currentUser!,
            type: "comment",
            url: `${authorId}/${post?.id}/#comment-${commentRef.id}`,
            content: text,
          });
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
        alt={currentUser?.displayName ?? "Unknow User"}
        src={
          currentUser?.photoURL
            ? currentUser.photoURL
            : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
        }
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
