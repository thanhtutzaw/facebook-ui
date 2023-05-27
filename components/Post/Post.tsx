import {
  faCircleCheck,
  faCircleDot,
  faComment,
  faEllipsisH,
  faShare,
  faThumbsUp,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import { useContext, useRef, useState } from "react";
import { Post as PostType, Props } from "../../types/interfaces";
import styles from "./Post.module.scss";
import { useRouter } from "next/router";
import { AppContext } from "../../context/AppContext";
import { deletePost } from "../../lib/firestore/post";
import { getAuth } from "firebase/auth";
import { app } from "../../lib/firebase";
// import { Post } from "../../types/interfaces";
// type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
// interface Props {
//   post: Post;
// }
interface PostProps {
  active?: boolean;
  post: PostType;
  tabIndex: number;
}
export default function Post({ active, post, tabIndex }: PostProps) {
  const { authorId, id, text, visibility, createdAt } = post;
  const [Bounce, setBounce] = useState(false);
  const date = new Timestamp(createdAt.seconds, createdAt.nanoseconds);
  // const date = createdAt ? createdAt?.toDate().toLocaleDateString() : 0;
  const [checked, setChecked] = useState(false);
  const checkRef = useRef<HTMLButtonElement>(null);
  const uncheckRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { showAction, setshowAction } = useContext(AppContext) as Props;
  if (!active && checked) {
    setChecked(false);
  }
  if (active && showAction) {
    setshowAction?.("");
  }
  const auth = getAuth(app);
  return (
    <div
      className={styles.post}
      style={{ userSelect: active ? "none" : "initial" }}
    >
      <span
        onClick={() => {
          if (!active) {
            router.push(id?.toString()!);
            // setactiveNote(id);
            // if (activeNote !== id) return;
            // setactiveNote("");
          } else {
            !checked ? checkRef.current?.click() : uncheckRef.current?.click();
          }
        }}
      >
        <div className={styles.header}>
          <div className={styles.left}>
            <Image
              className={styles.profile}
              alt={text}
              width={200}
              height={200}
              style={{ objectFit: "cover" }}
              src={
                // "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                authorId === "rEvJE0sb1yVJxfHTbtn915TSfqJ2"
                  ? "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
                  : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
              }
              // src={
              //   "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
              // }
            />
            <div>
              <p>
                {authorId === "rEvJE0sb1yVJxfHTbtn915TSfqJ2"
                  ? "Peter 1"
                  : "Other User"}
              </p>
              <p>{date.toDate().toLocaleDateString()}</p>
              {/* {createdAt && <time>{createdAt ? date : "date"}</time>} */}
              <p>{visibility}</p>
            </div>
          </div>
          {!active ? (
            <button
              aria-expanded={showAction !== ""}
              onClick={(e) => {
                e.stopPropagation();
                setshowAction?.(id?.toString());
                if (showAction === id) {
                  setshowAction?.("");
                }
                // alert(showAction);
              }}
            >
              <FontAwesomeIcon icon={faEllipsisH} />
            </button>
          ) : (
            <>
              {checked ? (
                <button
                  ref={uncheckRef}
                  className={styles.check}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // alert("hey");
                    setChecked(false);
                  }}
                >
                  <FontAwesomeIcon icon={faCircleCheck} />
                </button>
              ) : (
                <button
                  ref={checkRef}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setChecked(true);
                    // alert("hey");
                  }}
                >
                  <FontAwesomeIcon icon={faCircleDot} />
                </button>
              )}
            </>
          )}
        </div>
        {/* <p>author_Id: {authorId}</p> */}
        {/* <p>post_id: {id}</p> */}
        {showAction === id && (
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                await deletePost(auth.currentUser?.uid!, id!);
                router.replace("/", undefined, {
                  scroll: false,
                });
                setshowAction?.("");
              } catch (error: any) {
                alert(error.message);
              }
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
            Delete
          </button>
        )}
        <p>{text}</p>
      </span>
      <div
        className={styles.action}
        // onPointerEnter={() => setBounce(true)}
        // onPointerLeave={() => setBounce(false)}
      >
        <button tabIndex={tabIndex}>
          <FontAwesomeIcon bounce={Bounce} icon={faThumbsUp} />
          <p>Like</p>
        </button>
        <button tabIndex={tabIndex}>
          <FontAwesomeIcon icon={faComment} bounce={Bounce} />

          <p>Comment</p>
        </button>
        <button tabIndex={tabIndex}>
          <FontAwesomeIcon icon={faShare} bounce={Bounce} />
          <p>Share</p>
        </button>
      </div>
    </div>
  );
}
