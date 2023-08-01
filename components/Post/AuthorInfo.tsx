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
  increment,
  writeBatch,
} from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import { MouseEventHandler, ReactNode, useState } from "react";
import { Comment, Post, account } from "../../types/interfaces";
import styles from "./index.module.scss";
import { db } from "../../lib/firebase";
export default function AuthorInfo(props: {
  navigateToProfile?: MouseEventHandler;
  post?: Post;
  isAdmin?: boolean;
  commentRef?: DocumentReference<DocumentData>;
  postRef?: any;
  comment?: Comment;
  children?: ReactNode;
}) {
  const {postRef, commentRef, isAdmin, comment, children, navigateToProfile, post } =
    props;
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();
  const batch = writeBatch(db);
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
  const { author, createdAt, authorId } = comment!;
  return (
    <div className={styles.header}>
      <Author
        authorId={authorId}
        createdAt={createdAt}
        comment={comment!}
        navigateToProfile={() => {
          router.push(`/${authorId.toString()}`);
        }}
        profile={author}
      >
        {children}
      </Author>
      {isAdmin && (
        <button
          onClick={async () => {
            setDeleteLoading(true);
            try {

              batch.delete(commentRef!);
              batch.update(postRef, {
                commentCount: increment(-1),
              });
              await batch.commit();
              setDeleteLoading(false);
              router.push(router.asPath);
            } catch (error: any) {
              console.error(error);
              alert(error.message);
              setDeleteLoading(false);
            }
          }}
          aria-label="Delete Comment"
          disabled={deleteLoading}
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
    <div
      style={{ userSelect: comment ? "initial" : "none" }}
      className={styles.authorInfo}
    >
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
        <p style={{ userSelect: "none" }} className={styles.name}>
          <span
            style={{ color: comment ? "rgb(46 46 46)" : "initial" }}
            onClick={navigateToProfile}
          >
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
