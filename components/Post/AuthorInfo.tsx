import { checkPhotoURL, getFullName } from "@/lib/firestore/profile";
import {
  faEarth,
  faLock,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DocumentData, DocumentReference } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import { CSSProperties, MouseEventHandler, ReactNode, memo } from "react";
import { JSONTimestampToDate } from "../../lib/firebase";
import { Post, account } from "../../types/interfaces";
import styles from "./index.module.scss";
type layoutTypes = "row" | "column";

function AuthorInfo(props: {
  nested?: boolean;
  setisDropDownOpenInNestedComment?: Function;
  size?: number;
  parentId?: string;
  setComments?: Function;
  handleEditComment?: Function;
  navigateToProfile?: MouseEventHandler;
  profile?: account["profile"];
  isAdmin?: boolean;
  commentRef?: DocumentReference<DocumentData>;
  postRef?: DocumentReference<DocumentData>;
  comment?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
  layout?: layoutTypes;
  post?: Post;
}) {
  const {
    // parentId,
    // setisDropDownOpenInNestedComment,
    size,
    // setComments,
    // handleEditComment,
    post,
    layout,
    profile,
    style,
    // postRef,
    // commentRef,
    // isAdmin,
    comment,
    children,
    // nested,
    navigateToProfile,
  } = props;
  const router = useRouter();

  if (post) {
    const { author, createdAt, visibility } = post;
    const profile = author as account["profile"];
    //   if (router.pathname === "/") {
    //     router.push(
    //       { query: { user: String(post?.authorId) } },
    //       String(post?.authorId)
    //     );
    //   } else {
    //     router.push(`/${String(post?.authorId)}`);
    //   }
    const textEnd = post?.sharePost?.id && <>&nbsp; shared a Post</>;
    return (
      <div className={styles.header}>
        <User
          size={size!}
          navigateToProfile={navigateToProfile}
          profile={profile}
        >
          <UserName
            hasChildren={true}
            profile={profile}
            textEnd={textEnd}
            navigateToProfile={navigateToProfile}
          />
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
        </User>
        {children}
      </div>
    );
  }
  if (comment) {
    // const isRepliedBySameAuthor =
    //   comment && comment.authorId !== comment.recipient?.id;
    return (
      <div style={style} className={`relative ${styles.header} `}>
        {children}
      </div>
    );
  }
  return (
    <div style={style} className={` ${styles.header} `}>
      <User
        style={{ userSelect: "initial" }}
        size={size!}
        layout={layout}
        profile={profile}
        navigateToProfile={navigateToProfile}
      >
        <UserName
          hasChildren={!!children}
          profile={profile!}
          navigateToProfile={navigateToProfile}
        />
        {children}
      </User>
    </div>
  );
}

function User(props: {
  navigateToProfile?: MouseEventHandler<HTMLSpanElement>;
  profile?: account["profile"];
  layout?: layoutTypes;
  children?: ReactNode;
  size: number;
  style?: CSSProperties;
}) {
  const {
    style,
    size,
    layout = "column",
    navigateToProfile,
    profile,
    children,
  } = props;

  return (
    <div style={style} className={`${styles.authorInfo}`}>
      <UserAvatarPicture
        size={size}
        navigateToProfile={navigateToProfile}
        profile={profile}
      />
      <div
        style={{
          display: "flex",
          margin: " auto 0",
          flexDirection: layout,
          flex: " 1",
          wordBreak: "break-word",
          gap: "2px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
function UserName(props: {
  profile: account["profile"];
  navigateToProfile?: MouseEventHandler<HTMLSpanElement>;
  textEnd?: ReactNode;
  hasChildren: boolean;
  comment?: boolean;
}) {
  const {
    hasChildren: children,
    profile,
    textEnd,
    navigateToProfile,
    comment,
  } = props;
  return (
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
          navigateToProfile?.(e);
        }}
      >
        {getFullName(profile)}
      </span>
      {textEnd}
    </p>
  );
}
function UserAvatarPicture({
  navigateToProfile,
  profile,
  size = 45,
}: {
  navigateToProfile?: MouseEventHandler<HTMLImageElement>;
  profile?: account["profile"];
  size: number;
}) {
  const profilePicture = checkPhotoURL(profile?.photoURL);
  return (
    <Image
      priority={false}
      loading="lazy"
      onClick={navigateToProfile}
      className={`w-[${size}px] h-[${size}px] rounded-full object-cover b-0 m-[initial] outline-[1px solid rgba(128,128,128,0.168627451)] bg-avatarBg`}
      alt={`${profile?.firstName ?? "Unknown User"} ${profile?.lastName ?? ""}`}
      width={100}
      height={100}
      style={{
        objectFit: "cover",
      }}
      src={profilePicture}
    />
  );
}

export default memo(AuthorInfo);
export { User, UserName };
