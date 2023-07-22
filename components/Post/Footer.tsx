import {
  faComment,
  faPen,
  faShare,
  faShareFromSquare,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import {
  StyleHTMLAttributes,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import { app, db } from "../../lib/firebase";
import { addPost } from "../../lib/firestore/post";
import { Post } from "../../types/interfaces";
import styles from "./index.module.scss";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";

export function Footer(
  props: {
    likeCount?: number;
    setlikeCount?: Function;
    post: Post;
    tabIndex?: number;
  } & StyleHTMLAttributes<HTMLDivElement>
) {
  const { likeCount, setlikeCount, post, tabIndex, ...rests } = props;
  const { id, authorId } = post;
  const { dropdownRef, shareAction, setshareAction } = useContext(
    PageContext
  ) as PageProps;
  const router = useRouter();
  const commentRef = useRef<HTMLDivElement>(null);
  const auth = getAuth(app);
  const [savedVisibility, setsavedVisibility] = useState("");
  useEffect(() => {
    setsavedVisibility(localStorage.getItem("visibility")!);
  }, []);
  // const [reaction, setReaction] = useState({
  //   like: ["1a", "2d"],
  // });
  const [reactionAction, setreactionAction] = useState("");
  const likeRef = doc(
    db,
    `users/${post.authorId}/posts/${post.id}/likes/${auth?.currentUser?.uid}`
  );
  const [likeToggle, setlikeToggle] = useState(false);
  useEffect(() => {
    const likeCollectionRef = collection(
      db,
      `users/${post.authorId}/posts/${post.id}/likes`
    );

    async function getLikeCount() {
      const isUserLikeThisPost = await getDoc(likeRef);
      const likes = await getDocs(likeCollectionRef);
      const likeCount = likes.docs.length;
      if (isUserLikeThisPost.exists()) {
        setlikeCount?.(likeCount);
        setlikeToggle(true);
      } else {
        setlikeCount?.(likeCount);
        setlikeToggle(false);
      }
    }
    getLikeCount();
  }, [post.authorId, post.id, likeToggle, post.isLiked, likeRef, setlikeCount]);
  return (
    <div
      // onMouseLeave={() => {
      //   setTimeout(() => {
      //     setreactionAction("");
      //   }, 500);
      //   // console.log("like");
      // }}
      ref={commentRef}
      {...rests}
      className={styles.action}
    >
      <div
        className={styles.socialButton}
        // onMouseEnter={() => {
        //   setreactionAction(id?.toString()!);
        //   // console.log("like");
        // }}
        // onMouseLeave={() => {
        //   setTimeout(() => {
        //     setreactionAction("");
        //   }, 500);
        //   // console.log("like");
        // }}
      >
        <button
          onClick={async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) {
              alert("Error : User Not Found . Sign up and Try Again ! ");
              return;
            }
            setlikeToggle((prev) => !prev);
            if (likeToggle) {
              await deleteDoc(likeRef);
            } else {
              await setDoc(likeRef, { uid });
            }
            // router.replace("/", undefined, { scroll: false });
          }}
          aria-expanded={reactionAction !== ""}
          aria-label="Like Post"
          title="Like"
          tabIndex={-1}
          className={`${likeToggle ? styles.active : ""}`}
        >
          <FontAwesomeIcon icon={faThumbsUp} />
          <p>{likeToggle ? "Liked" : "Like"} </p>
          {/* {JSON.stringify(post.like)} */}
        </button>
        <AnimatePresence>
          {reactionAction === id && (
            <motion.div
              onMouseEnter={() => {
                setreactionAction(id?.toString()!);
              }}
              className={styles.actions}
              initial={{
                opacity: "0",
                scale: 0.8,
              }}
              animate={{
                opacity: reactionAction === id ? 1 : 0,
                scale: 1,
              }}
              exit={{
                opacity: "0",
                scale: 0.8,
              }}
              transition={{
                duration: 0.15,
              }}
              style={{
                minWidth: "initial",
                position: "absolute",
                right: "initial",
                left: "0px",
                top: "-4rem",
                margin: "0 1rem",
              }}
            >
              <button
                onMouseUp={() => {
                  alert("hey");
                }}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <FontAwesomeIcon icon={faThumbsUp} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div>
        <button
          className={styles.socialButton}
          title="Comment"
          tabIndex={-1}
          onClick={(e) => {
            router.push({
              pathname: `${authorId}/${id?.toString()}`,
              // hash: "comment",
            });
          }}
        >
          <FontAwesomeIcon icon={faComment} />
          <p>Comment</p>
        </button>
      </div>
      <div
      // className={styles.socialButton}
      >
        <button
          style={
            {
              // overflow: "hidden",
              // zIndex: shareAction === id ? "100" : "initial",
            }
          }
          tabIndex={-1}
          aria-expanded={shareAction !== ""}
          aria-label="open share options"
          title="Share"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setshareAction?.(id?.toString()!);
            if (shareAction === id) {
              setshareAction?.("");
            }
          }}
        >
          <FontAwesomeIcon icon={faShare} />
          <p>Share </p>
        </button>
        {shareAction && (
          <div
            // onPointerMove={(e) => {
            //   if (shareAction === id) {
            //     e.preventDefault();
            //     return;
            //   }
            // }}
            // onScroll={(e) => {
            //   if (shareAction === id) {
            //     e.preventDefault();
            //     return;
            //   }
            // }}
            // onWheel={(e) => {
            //   console.log(document.body.scrollTop);
            //   e.preventDefault();
            //   console.log("wheeling in backdrop");
            //   return;
            // }}
            style={{
              backgroundColor: "transparent",
              position: "fixed",
              inset: 0,
              opacity: 0.3,
            }}
          />
        )}
        <AnimatePresence>
          {shareAction === id && (
            <motion.div
              ref={dropdownRef}
              key={id}
              initial={{
                opacity: "0",
                scale: 0.8,
              }}
              animate={{
                opacity: shareAction === id ? 1 : 0,
                scale: 1,
              }}
              exit={{
                opacity: "0",
                scale: 0.8,
              }}
              transition={{
                duration: 0.15,
              }}
              className={styles.actions}
              style={{ top: "-6rem", right: "1rem" }}
            >
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const sharePost = { author: authorId.toString(), id: id! };
                  try {
                    window.document.body.style.cursor = "wait";
                    await addPost(
                      auth?.currentUser?.uid!,
                      savedVisibility,
                      "",
                      [],
                      sharePost
                      // post
                    );
                    router.replace("/", undefined, { scroll: false });
                    setshareAction?.("");
                    window.document.body.style.cursor = "initial";
                  } catch (error: any) {
                    alert(error.message);
                  }
                }}
              >
                <FontAwesomeIcon icon={faShareFromSquare} />
                Share Now
              </button>
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push({
                    pathname: "/share",
                    query: { author: authorId, id: id },
                  });
                  setshareAction?.("");
                }}
              >
                <FontAwesomeIcon icon={faPen} />
                Write Post
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* <AnimatePresence>
        {reactionAction === id && (
          <motion.div
            ref={dropdownRef}
            key={id}
            initial={{
              opacity: "0",
              scale: 0.8,
            }}
            animate={{
              opacity: shareAction === id ? 1 : 0,
              scale: 1,
            }}
            exit={{
              opacity: "0",
              scale: 0.8,
            }}
            transition={{
              duration: 0.15,
            }}
            className={styles.actions}
            style={{ top: "-6rem", right: "1rem" }}
          >
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const sharePost = { author: authorId.toString(), id: id! };
                try {
                  window.document.body.style.cursor = "wait";
                  await addPost(
                    auth?.currentUser?.uid!,
                    savedVisibility,
                    "",
                    [],
                    sharePost
                    // post
                  );
                  router.replace("/", undefined, { scroll: false });
                  setshareAction?.("");
                  window.document.body.style.cursor = "initial";
                } catch (error: any) {
                  alert(error.message);
                }
              }}
            >
              <FontAwesomeIcon icon={faShareFromSquare} />
              Share Now
            </button>
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push({
                  pathname: "/share",
                  query: { author: authorId, id: id },
                });
                setshareAction?.("");
              }}
            >
              <FontAwesomeIcon icon={faPen} />
              Write Post
            </button>
          </motion.div>
        )}
      </AnimatePresence> */}
    </div>
  );
}
