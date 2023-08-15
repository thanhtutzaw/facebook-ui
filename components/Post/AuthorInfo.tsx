import {
  faEarth,
  faLock,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DocumentData, DocumentReference, Timestamp } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { Comment, Post, account } from "../../types/interfaces";
import styles from "./index.module.scss";
import Action from "../Comment/Action";
export default function AuthorInfo(props: {
  navigateToProfile?: MouseEventHandler;
  post?: Post;
  isAdmin?: boolean;
  commentRef?: DocumentReference<DocumentData>;
  postRef?: DocumentReference<DocumentData>;
  comment?: Comment;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const {
    style,
    postRef,
    commentRef,
    isAdmin,
    comment,
    children,
    navigateToProfile,
    post,
  } = props;
  const router = useRouter();
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
          <div className={styles.moreInfo}>
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
              <span
                // aria-label="Everyone can see this Post"
                title="Everyone can see this Post"
              >
                <FontAwesomeIcon icon={faEarth} />
              </span>
            )}
            {visibility?.toLowerCase() === "friend" && (
              <span
                // aria-label="Friends can see this Post"
                title="Friends can see this Post"
              >
                <FontAwesomeIcon icon={faUserGroup} />
              </span>
            )}
            {visibility?.toLowerCase() === "onlyme" && (
              <span
                // aria-label="Only you can see this Post"
                title="Only you can see this Post"
              >
                <FontAwesomeIcon icon={faLock} />
              </span>
            )}
          </div>
        </Author>
        {children}
      </div>
    );
  }
  const { author, createdAt, authorId } = comment!;
  const profile = author as account["profile"];
  return (
    <div style={style} className={styles.header}>
      <Author
        authorId={authorId}
        createdAt={createdAt}
        comment={comment!}
        navigateToProfile={() => {
          router.push(`/${authorId.toString()}`);
        }}
        profile={profile}
      >
        {children}
      </Author>
      {isAdmin && <Action postRef={postRef!} commentRef={commentRef!} />}
    </div>
  );
}

function Author(props: {
  navigateToProfile: any;
  profile: account["profile"];
  authorId: any;
  post?: Post;
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
        }`}
        width={200}
        height={200}
        style={{
          objectFit: "cover",
        }}
        src={
          (profile?.photoURL as string)
            ? (profile?.photoURL as string)
            : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
        }
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p
          style={{ flexWrap: "wrap", userSelect: "none" }}
          className={styles.name}
        >
          <span
            style={{
              whiteSpace: "pre",
              color: comment ? "rgb(46 46 46)" : "initial",
            }}
            onClick={navigateToProfile}
          >
            {profile?.firstName ?? post?.authorId ?? comment?.authorId}{" "}
            {profile?.lastName ?? ""}
          </span>
          {post?.sharePost?.id && post && <>&nbsp; shared a Post</>}
        </p>

        {children}
      </div>
    </div>
  );
}
