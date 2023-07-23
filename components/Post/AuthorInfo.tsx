import {
  faEarth,
  faLock,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import styles from "./index.module.scss";
import { MouseEventHandler, ReactNode } from "react";
import { Post, account } from "../../types/interfaces";
export default function AuthorInfo(props: {
  navigateToProfile?: MouseEventHandler;
  post: Post;
  children?: ReactNode;
}) {
  const { children, navigateToProfile, post } = props;
  const { author, authorId, createdAt, visibility, updatedAt } = post;
  const profile = author as account["profile"];
  return (
    <div className={styles.header}>
      {/* <h1>{author?.displayName}</h1> */}
      <div className={styles.authorInfo}>
        <Image
          onClick={navigateToProfile}
          priority={false}
          className={styles.profile}
          // alt={author?.displayName ? author?.displayName : "Unknown User"}
          alt={`${profile?.firstName ?? "Unknow"} ${
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
              : author?.photoURL
              ? author?.photoURL
              : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
          }
        />
        {/* <h1>{JSON.stringify(post.author, null, 4)}</h1> */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {/* {JSON.stringify(post, null, 4)} */}
          <p className={styles.name}>
            <span onClick={navigateToProfile}>
              {/* {author ? "Unknow User"} */}
              {profile?.firstName ?? "Unknow"} {profile?.lastName ?? "User"}
              {/* {author?.displayName ?? "Unknow User"} */}
            </span>
            {post.sharePost && <>&nbsp; shared a Post</>}
          </p>
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
        </div>
      </div>
      {children}
    </div>
  );
}
