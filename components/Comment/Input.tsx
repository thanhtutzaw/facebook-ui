import { checkPhotoURL } from "@/lib/firestore/profile";
import { faArrowAltCircleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { doc } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import { db, getCollectionPath, getPath } from "../../lib/firebase";
import { addComment } from "../../lib/firestore/comment";
import { sendAppNoti } from "../../lib/firestore/notifications";
import { Post, account } from "../../types/interfaces";
import s from "./index.module.scss";
import useQueryFn from "@/hooks/useQueryFn";
export default function CommentInput(props: {
  setlimitedComments: any;
  uid?: string;
  postId: string;
  authorId: string;
  post?: Post;

  profile?: account["profile"];
}) {
  const { queryFn } = useQueryFn();
  const { setlimitedComments, post, uid, authorId, postId, profile } = props;
  const { currentUser } = useContext(PageContext) as PageProps;
  const [text, settext] = useState("");
  const commentRef = doc(getPath("comments", { authorId, postId }));
  const router = useRouter();
  const [addLoading, setaddLoading] = useState(false);
  const postRef = doc(
    db,
    `${getCollectionPath.posts({ uid: authorId })}/${postId}`
  );
  const previousCommentCount = post?.comments?.length ?? 0;
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
          queryFn.invalidate("myPost");
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
        className={`
        rounded-full
    object-cover
    b-0
    w-[45px]
    h-[45px]
    flex
    outline-[1px solid rgba(128,128,128,0.168627451)] bg-avatarBg
       
        `}
        width={200}
        height={200}
        priority
        alt={currentUser?.displayName ?? "Unknow User"}
        src={checkPhotoURL(
          profile ? (profile?.photoURL as string) : currentUser?.photoURL
        )}
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
