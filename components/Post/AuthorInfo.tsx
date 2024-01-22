import { checkPhotoURL, getFullName } from "@/lib/firestore/profile";
import { DocumentData, DocumentReference } from "firebase/firestore";
import Image from "next/image";
import { CSSProperties, MouseEventHandler, ReactNode, memo } from "react";
import { account } from "../../types/interfaces";
import styles from "./index.module.scss";
type layoutTypes = "row" | "column";

function AuthorInfo(props: {
  nested?: boolean;
  setisDropDownOpenInNestedComment?: Function;
  size?: number;
  parentId?: string;
  setComments?: Function;
  handleEditComment?: Function;
  profile?: account["profile"];
  isAdmin?: boolean;
  commentRef?: DocumentReference<DocumentData>;
  postRef?: DocumentReference<DocumentData>;
  // comment?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
  // post?: Post;
}) {
  const { size, profile, style, children } = props;
  // if (post) {
  //   const { author, createdAt, visibility } = post;
  //   const profile = author as account["profile"];
  //   //   if (router.pathname === "/") {
  //   //     router.push(
  //   //       { query: { user: String(post?.authorId) } },
  //   //       String(post?.authorId)
  //   //     );
  //   //   } else {
  //   //     router.push(`/${String(post?.authorId)}`);
  //   //   }
  //   const textEnd = post?.sharePost?.id && <>&nbsp; shared a Post</>;
  //   return (
  //     <div className={styles.header}>
  //       <User2
  //         size={size!}
  //         profile={profile}
  //       >
  //         <UserName
  //           hasChildren={true}
  //           profile={profile}
  //           textEnd={textEnd}
  //         />
  //         <div className={styles.moreInfo}>
  //           {typeof createdAt !== "number" && (
  //             <p className={styles.date} suppressHydrationWarning>
  //               {JSONTimestampToDate(createdAt).toLocaleDateString("en-US", {
  //                 year: "numeric",
  //                 month: "short",
  //                 day: "numeric",
  //               })}
  //             </p>
  //           )}
  //           {visibility?.toLowerCase() === "public" && (
  //             <span title="Everyone can see this Post">
  //               <FontAwesomeIcon icon={faEarth} />
  //             </span>
  //           )}
  //           {visibility?.toLowerCase() === "friend" && (
  //             <span title="Friends can see this Post">
  //               <FontAwesomeIcon icon={faUserGroup} />
  //             </span>
  //           )}
  //           {visibility?.toLowerCase() === "onlyme" && (
  //             <span title="Only you can see this Post">
  //               <FontAwesomeIcon icon={faLock} />
  //             </span>
  //           )}
  //         </div>
  //       </User2>
  //       {children}
  //     </div>
  //   );
  // }
  // if (comment) {
  // const isRepliedBySameAuthor =
  //   comment && comment.authorId !== comment.recipient?.id;
  return (
    <div style={style} className={`relative ${styles.header} `}>
      {children}
    </div>
  );
  // }
  // return (
  //   <div style={style} className={` ${styles.header} `}>
  //     <User2
  //       style={{ userSelect: "initial" }}
  //       size={size!}
  //       layout={layout}
  //       profile={profile}
  //     >
  //       <UserName
  //         hasChildren={!!children}
  //         profile={profile!}
  //       />
  //       {children}
  //     </User2>
  //   </div>
  // );
}

function User(props: {
  navigateToProfile: MouseEventHandler<HTMLSpanElement>;
  profile: account["profile"];
  layout?: layoutTypes;
  children?: ReactNode;
  size?: number;
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
  navigateToProfile: MouseEventHandler<HTMLSpanElement>;
  textEnd?: ReactNode;
  hasChildren?: boolean;
  comment?: boolean;
}) {
  const {
    hasChildren = false,
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
        marginBottom: hasChildren ? "2px" : "initial",
      }}
      className={styles.name}
    >
      <span
        style={{
          color: comment ? "rgb(46 46 46)" : "initial",
          fontSize: !hasChildren ? "18px" : "inherit",
          fontWeight: hasChildren ? "500" : "initial",
        }}
        onClick={(e) => {
          e.stopPropagation();
          navigateToProfile(e);
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
  navigateToProfile: MouseEventHandler<HTMLImageElement>;
  profile?: account["profile"];
  size?: number;
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
