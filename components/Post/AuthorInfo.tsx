import {
  faEarth,
  faLock,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DocumentData, DocumentReference } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import { CSSProperties, MouseEventHandler, ReactNode, useContext } from "react";
import { JSONTimestampToDate } from "../../lib/firebase";
import { Comment, Post, account } from "../../types/interfaces";
import CommentAction from "../Comment/Action";
import styles from "./index.module.scss";
import { PostContext, PostProps } from "./PostContext";
import { getFullName } from "@/lib/firestore/profile";
type layoutTypes = "row" | "column";

export default function AuthorInfo(props: {
  navigateToProfile?: MouseEventHandler;
  profile?: account["profile"];
  isAdmin?: boolean;
  commentRef?: DocumentReference<DocumentData>;
  postRef?: DocumentReference<DocumentData>;
  comment?: Comment;
  style?: CSSProperties;
  children?: ReactNode;
  layout?: layoutTypes;
  post?: Post;
}) {
  const {
    post,
    layout,
    profile,
    style,
    postRef,
    commentRef,
    isAdmin,
    comment,
    children,
    navigateToProfile,
  } = props;
  const router = useRouter();
  if (post) {
    const { author, createdAt, visibility } = post;
    const profile = author as account["profile"];
    return (
      <div className={styles.header}>
        <Author
          navigateToProfile={navigateToProfile}
          profile={profile}
          post={post}
          comment={comment!}
        >
          <div className={styles.moreInfo}>
            {typeof createdAt !== "number" && (
              <p className={styles.date} suppressHydrationWarning>
                {JSONTimestampToDate(createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
            {visibility?.toLowerCase() === "public" && (
              <span title="Everyone can see this Post">
                <FontAwesomeIcon icon={faEarth} />
              </span>
            )}
            {visibility?.toLowerCase() === "friend" && (
              <span title="Friends can see this Post">
                <FontAwesomeIcon icon={faUserGroup} />
              </span>
            )}
            {visibility?.toLowerCase() === "onlyme" && (
              <span title="Only you can see this Post">
                <FontAwesomeIcon icon={faLock} />
              </span>
            )}
          </div>
        </Author>
        {children}
      </div>
    );
  }
  if (comment) {
    const { author, authorId } = comment;
    const profile = author as account["profile"];
    return (
      <div style={style} className={styles.header}>
        <Author
          comment={comment!}
          navigateToProfile={() => {
            router.push(`/${authorId.toString()}`);
          }}
          profile={profile}
        >
          {children}
        </Author>
        {isAdmin && (
          <CommentAction postRef={postRef!} commentRef={commentRef!} />
        )}
      </div>
    );
  }
  return (
    <div style={style} className={styles.header}>
      <Author
        layout={layout}
        profile={profile}
        comment={comment!}
        navigateToProfile={navigateToProfile}
      >
        {children}
      </Author>
      {isAdmin && <CommentAction postRef={postRef!} commentRef={commentRef!} />}
    </div>
  );
}
function Author(props: {
  navigateToProfile?: MouseEventHandler<HTMLImageElement>;
  profile?: account["profile"];
  post?: Post;
  layout?: layoutTypes;
  comment: Comment;
  children?: ReactNode;
}) {
  const {
    layout = "column",
    navigateToProfile,
    profile,
    post,
    comment,
    children,
  } = props;
  const router = useRouter();

  return (
    <div
      style={{ userSelect: comment ? "initial" : "none" }}
      className={styles.authorInfo}
    >
      <Avatar navigateToProfile={navigateToProfile} profile={profile} />
      <div
        // className={styles.subInfo}
        style={{
          display: "flex",
          margin: " auto 0",
          flexDirection: layout,
          flex: " 1",
          wordBreak: "break-word",
          gap: "2px",
        }}
      >
        <p
          style={{
            flex: "1",
            flexWrap: "wrap",
            userSelect: "none",
            marginBottom: children ? "2px" : "initial",
          }}
          className={styles.name}
        >
          <span
            style={{
              color: comment ? "rgb(46 46 46)" : "initial",
              fontSize: !children ? "18px" : "inherit",
              fontWeight: children ? "500" : "initial",
            }}
            onClick={(e) => {
              e.stopPropagation();
              router.push(
                { query: { user: String(post?.authorId) } },
                String(post?.authorId)
              );
            }}
          >
            {/* {post?.authorId ?? "Unknown"} */}
            {getFullName(profile)}
            {/* {profile?.firstName ?? post?.authorId ?? comment?.authorId}{" "}
            {profile?.lastName ?? ""} */}
          </span>

          {post?.sharePost?.id && <>&nbsp; shared a Post</>}
        </p>
        {children}
      </div>
    </div>
  );
}

function Avatar({
  navigateToProfile,
  profile,
}: {
  navigateToProfile?: MouseEventHandler<HTMLImageElement>;
  profile?: account["profile"];
}) {
  const profileFallback =
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
  const profilePicture = (profile?.photoURL as string)
    ? (profile?.photoURL as string)
    : profileFallback;
  return (
    <Image
      onClick={navigateToProfile}
      priority={false}
      className={styles.profile}
      alt={`${profile?.firstName ?? "Unknown User"} ${profile?.lastName ?? ""}`}
      width={200}
      height={200}
      style={{
        objectFit: "cover",
      }}
      src={profilePicture}
    />
  );
}
