import {
  faEarth,
  faLock,
  faTrash,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  DocumentData,
  DocumentReference,
  Timestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Image from "next/image";
import { MouseEventHandler, ReactNode } from "react";
import { db } from "../../lib/firebase";
import { Comment, Post, account } from "../../types/interfaces";
import styles from "./index.module.scss";
export default function AuthorInfo(props: {
  navigateToProfile?: MouseEventHandler;
  post?: Post;
  isAdmin?: boolean;
  commentRef?: DocumentReference<DocumentData>;
  comment?: Comment;
  children?: ReactNode;
}) {
  const { commentRef, isAdmin, comment, children, navigateToProfile, post } =
    props;

  if (post) {
    const { author, authorId, createdAt, visibility } = post;
    const profile = author as account["profile"];
    return (
      <div className={styles.header}>
        <Author
          navigateToProfile={navigateToProfile}
          profile={profile}
          authorId={authorId}
          post={post}
          comment={comment!}
          createdAt={createdAt}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <p className={styles.date} suppressHydrationWarning>
              {new Timestamp(createdAt?.seconds, createdAt?.nanoseconds)
                .toDate()
                .toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
            </p>
            {visibility?.toLowerCase() === "public" && (
              <p
                aria-label="Everyone can see this Post"
                title="Everyone can see this Post"
              >
                <FontAwesomeIcon icon={faEarth} />
              </p>
            )}
            {visibility?.toLowerCase() === "friend" && (
              <p
                aria-label="Friends can see this Post"
                title="Friends can see this Post"
              >
                <FontAwesomeIcon icon={faUserGroup} />
              </p>
            )}
            {visibility?.toLowerCase() === "onlyme" && (
              <p
                aria-label="Only you can see this Post"
                title="Only you can see this Post"
              >
                <FontAwesomeIcon icon={faLock} />
              </p>
            )}
          </div>
        </Author>
        {children}
      </div>
    );
  }
  const { id, text, author, createdAt, authorId } = comment!;

  return (
    <div className={styles.header}>
      <Author
        // style={{ alignItems: "center" }}
        authorId={authorId}
        createdAt={createdAt}
        comment={comment!}
        navigateToProfile={navigateToProfile}
        profile={author}
      >
        {children}
      </Author>
      {isAdmin && (
        <button
          onClick={async () => {
            // console.log(comment?.id);
            // console.log(commentRef.path);
            // if (!comment?.id) {
            //   alert("Delete Failed ! Comment id not found! ");
            //   return;
            // }

            try {
              await deleteDoc(commentRef!);
            } catch (error: any) {
              console.error(error);
              alert(error.message);
            }
            // console.log(commentRef.id);
          }}
          aria-label="Delete Comment"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      )}
    </div>
  );
}

function Author(props: {
  navigateToProfile: any;
  profile: any;
  authorId: any;
  post?: any;
  createdAt: any;
  comment: Comment;
  children?: ReactNode;
}) {
  const {
    navigateToProfile,
    profile,
    post,
    authorId,
    createdAt,
    comment,
    children,
  } = props;
  return (
    <div className={styles.authorInfo}>
      <Image
        onClick={navigateToProfile}
        priority={false}
        className={styles.profile}
        alt={`${profile?.firstName ?? "Unknown"} ${
          profile?.lastName ?? "User"
        }}`}
        width={200}
        height={200}
        style={{
          objectFit: "cover",
        }}
        src={
          authorId === "rEvJE0sb1yVJxfHTbtn915TSfqJ2"
            ? "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
            : profile?.photoURL
            ? profile?.photoURL
            : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
        }
      />
      <div
        style={{
          display: "flex",
          // gap: "8px",
          gap: "4px",
          flexDirection: "column",
          // flex: "1",
        }}
      >
        <p className={styles.name}>
          <span onClick={navigateToProfile}>
            {profile?.firstName ?? post?.id ?? comment?.authorId}{" "}
            {profile?.lastName ?? ""}
          </span>
          {post?.sharePost?.id && post && <>&nbsp; shared a Post</>}
        </p>

        {children}
      </div>
    </div>
  );
}
