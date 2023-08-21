import {
  faComment,
  faPen,
  faShare,
  faShareFromSquare,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc } from "firebase/firestore";
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
import { sendAppNoti } from "../../lib/firestore/notifications";
import { addPost, dislikePost, likePost } from "../../lib/firestore/post";
import { Post, account } from "../../types/interfaces";
import styles from "./index.module.scss";
export function Footer(
  props: {
    likeCount?: number;
    setLikes?: Function;
    setlikeCount?: Function;
    post: Post;
    profile?: account["profile"];
    tabIndex?: number;
  } & StyleHTMLAttributes<HTMLDivElement>
) {
  const {setLikes, profile, likeCount, setlikeCount, post, tabIndex, ...rests } = props;
  const router = useRouter();
  const commentRef = useRef<HTMLDivElement>(null);
  const [savedVisibility, setsavedVisibility] = useState("");
  const [reactionAction, setreactionAction] = useState("");
  const { queryClient } = useContext(PageContext) as PageProps;
  useEffect(() => {
    setsavedVisibility(localStorage.getItem("visibility")!);
  }, []);
  const [isLiked, setisLiked] = useState(post.isLiked);

  const { dropdownRef, shareAction, setshareAction } = useContext(
    PageContext
  ) as PageProps;
  const { id, author, authorId } = post;
  const authorProfile = author as account["profile"];
  const authorName = `${authorProfile.firstName} ${authorProfile.lastName}`;

  const auth = getAuth(app);
  const postRef = doc(db, `users/${authorId}/posts/${id}`);
  const likeRef = doc(
    db,
    `users/${post.authorId}/posts/${post.id}/likes/${auth?.currentUser?.uid}`
  );
  useEffect(() => {
    // const likeCollectionRef = collection(
    //   db,
    //   `users/${post.authorId}/posts/${post.id}/likes`
    // );

    async function getLikeCount() {
      const isUserLikeThisPost = await getDoc(likeRef);
      // const likes = await getDocs(likeCollectionRef);
      // const likeCount = likes.docs.length;
      const likeCount = post.likeCount;
      if (isUserLikeThisPost.exists()) {
        setlikeCount?.(likeCount);
        setisLiked(true);
      } else {
        setlikeCount?.(likeCount);
        setisLiked(false);
      }
    }
    try {
      getLikeCount();
    } catch (error: any) {
      if (error.code === "quota-exceeded") {
        // setpostError()

        alert("Firebase Quota Exceeded. Please try again later.");
        throw error;
      }
      console.error(error);
    }
  }, [isLiked, likeRef, post.likeCount, setlikeCount]);
  // const [reaction, setReaction] = useState({
  //   like: ["1a", "2d"],
  // });
  const [likeLoading, setLikeLoading] = useState(false);
  // const queryClient = useQueryClient();
  return (
    <div
      // onMouseLeave={() => {
      //   setTimeout(() => {
      //     setreactionAction("");
      //   }, 500);
      // }}
      ref={commentRef}
      {...rests}
      className={styles.action}
    >
      <div
        className={styles.socialButton}
        // onMouseEnter={() => {
        //   setreactionAction(id?.toString()!);
        // }}
        // onMouseLeave={() => {
        //   setTimeout(() => {
        //     setreactionAction("");
        //   }, 500);
        // }}
      >
        <button
          style={{ pointerEvents: likeLoading ? "none" : "initial" }}
          onClick={async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) {
              alert("Error : User Not Found . Sign up and Try Again ! ");
              return;
            }
            setisLiked((prev) => !prev);
            queryClient?.refetchQueries(["myPost"]);
            queryClient?.invalidateQueries(["myPost"]);
            setLikeLoading(true);
            if (isLiked) {
              setLikes?.([])
              await dislikePost(likeCount ?? 0, postRef, likeRef);
              setLikeLoading(false);
            } else {
              setLikes?.([])
              await likePost(likeCount ?? 0, postRef, likeRef, uid);
              await sendAppNoti(
                uid,
                post.authorId,
                profile!,
                "post_reaction",
                `${authorId}/${id}`
              );
              setLikeLoading(false);
            }
          }}
          aria-expanded={reactionAction !== ""}
          aria-label="Like this Post"
          title="Like"
          tabIndex={-1}
          className={`${isLiked ? styles.active : ""}`}
        >
          <FontAwesomeIcon icon={faThumbsUp} />
          <p>Like</p>
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
            if (router.asPath === `/${authorId}/${id?.toString()}`) return;
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
                  const uid = auth.currentUser?.uid;
                  if (!uid) {
                    alert("Error : User Not Found . Sign up and Try Again ! ");
                    return;
                  }
                  const shareRef = doc(collection(db, `users/${uid}/posts`));
                  const sharePost = {
                    refId: shareRef.id,
                    author: authorId.toString(),
                    id: id!,
                  };
                  try {
                    window.document.body.style.cursor = "wait";
                    await addPost(uid, savedVisibility, "", [], sharePost);
                    await sendAppNoti(
                      uid,
                      post?.authorId.toString()!,
                      profile!,
                      "share",
                      `${uid}/${sharePost.refId}`,
                      `${authorName} : ${post.text}`
                    );
                    router.replace("/", undefined, { scroll: false });
                    setshareAction?.("");
                    // queryClient?.invalidateQueries(["myPost"]);
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
