import {
  faComment,
  faPen,
  faShare,
  faShareFromSquare,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User, getAuth } from "firebase/auth";
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
import { addPost, likePost, unlikePost } from "../../lib/firestore/post";
import { Post, account } from "../../types/interfaces";
import styles from "./index.module.scss";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
export const Footer = (
  props: {
    likeCount?: number;
    setLikes?: Function;
    setlikeCount?: Function;
    post: Post;
    profile: User | null;
    tabIndex?: number;
  } & StyleHTMLAttributes<HTMLDivElement>
) => {
  const {
    setLikes,
    profile,
    likeCount,
    setlikeCount,
    post,
    tabIndex,
    ...rests
  } = props;
  const router = useRouter();
  const commentRef = useRef<HTMLDivElement>(null);
  const [visibility, setvisibility] = useState("");
  const [reactionAction, setreactionAction] = useState("");
  useEffect(() => {
    setvisibility(localStorage.getItem("visibility")!);
  }, []);
  const [isLiked, setisLiked] = useState(post.isLiked);

  const { queryClient, dropdownRef, shareAction, setshareAction } = useContext(
    PageContext
  ) as PageProps;
  const { id, author: authorAccount, authorId } = post;
  const authorProfile = authorAccount as account["profile"];
  const authorName = `${authorProfile?.firstName ?? "Unknow"} ${
    authorProfile?.lastName ?? "User"
  }`;

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
      const likeRef = doc(
        db,
        `users/${post.authorId}/posts/${post.id}/likes/${auth?.currentUser?.uid}`
      );
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
      console.log("getting like count");
      getLikeCount();
    } catch (error: any) {
      if (error.code === "quota-exceeded") {
        alert("Firebase Quota Exceeded. Please try again later.");
        throw error;
      }
      console.error(error);
    }
  }, [
    auth?.currentUser?.uid,
    post.authorId,
    post.id,
    post.likeCount,
    setlikeCount,
  ]);
  // const [reaction, setReaction] = useState({
  //   like: ["1a", "2d"],
  // });

  const [likeLoading, setLikeLoading] = useState(false);
  // const debounceLikeUnlike = useRef(debounce(handleLikeUnlike(), 1000)).current;
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
          disabled={likeLoading}
          style={{
            border: likeLoading ? "2px solid red" : "initial",
            pointerEvents: likeLoading ? "none" : "initial",
          }}
          // onClick={async () => await handleLikeUnlike()}
          onClick={async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) {
              alert("Error : User Not Found . Sign up and Try Again ! ");
              return;
            }
            setlikeCount?.(post.likeCount);
            setisLiked((prev) => !prev);
            queryClient?.refetchQueries(["myPost"]);
            queryClient?.invalidateQueries(["myPost"]);
            setLikeLoading(true);
            if (isLiked) {
              // setisLiked(false);
              setLikes?.([]);
              await unlikePost(likeCount ?? 0, postRef, likeRef);
              setLikeLoading(false);
              // setlikeCount?.(parseInt(post.likeCount.toString()) - 1);
            } else {
              // setlikeCount?.(parseInt(post.likeCount.toString()));
              // setisLiked(true);
              setLikes?.([]);

              // , { uid, message }

              await likePost(likeCount ?? 0, postRef, likeRef, uid);
              setLikeLoading(false);
              if (uid === post.authorId) return;
              await sendAppNoti(
                uid,
                post.authorId,
                profile!,
                "post_reaction",
                `${authorId}/${id}`
              );
              await fetch("/api/sendFCM", {
                method: "POST",
                headers: {
                  "Content-type": "application/json",
                },
                body: JSON.stringify({
                  recieptId: post.authorId.toString(),
                  message: `${
                    profile?.displayName ?? "Unknown User"
                  } liked this post`,
                  icon: profile?.photoURL
                    ? profile.photoURL
                    : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
                  badge: "/badge.svg",
                  tag: `Likes-${post.id}`,
                  link: `/${post.authorId}/${post.id}`,
                  // type:'post',
                  actions: [
                    { action: "see_post", title: "See Post" },
                    {
                      action: "Input",
                      title: "Input",
                      type: "input",
                      placeHolder: "Type Something",
                    },
                  ],
                  webpush: {
                    fcm_options: {
                      link: `https://facebook-ui-zee.vercel.app/${post.authorId}/${post.id}`,
                    },
                  },
                  // message: `${profile?.firstName ?? "Unknown User"} ${
                  //   profile.lastName ?? ""
                  // } liked this post`,
                }),
              });
            }
            router.replace(router.asPath, undefined, { scroll: false });
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
      <div className={styles.socialButton}>
        <button
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
      <div className={styles.socialButton}>
        <button
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
                    await handleShareNow(
                      uid,
                      visibility,
                      sharePost,
                      post,
                      profile,
                      authorName
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
    </div>
  );
};

async function handleShareNow(
  uid: string,
  visibility: string,
  sharePost: { refId: string; author: string; id: string },
  post: Post,
  profile: User | null,
  authorName: string
) {
  await addPost(uid, visibility, "", [], sharePost);
  await sendAppNoti(
    uid,
    post?.authorId.toString()!,
    profile!,
    "share",
    `${uid}/${sharePost.refId}`,
    `${authorName} : ${post.text}`
  );
}
// );
// Footer.displayName = "Footer";
