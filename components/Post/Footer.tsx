import useLocalStorage from "@/hooks/useLocalStorage";
import useQueryFn from "@/hooks/useQueryFn";
import {
  faComment,
  faPen,
  faShare,
  faShareFromSquare,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
} from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import popfx from "public/assets/bubble.mp3";
import { StyleHTMLAttributes, memo, useEffect, useRef, useState } from "react";
import useSound from "use-sound";
import { usePageContext } from "../../context/PageContext";
import { db, getCollectionPath, getPath } from "../../lib/firebase";
import {
  getMessage,
  sendAppNoti,
  sendFCM,
} from "../../lib/firestore/notifications";
import { addPost, reactPost, unReactPost } from "../../lib/firestore/post";
import { Post, account } from "../../types/interfaces";
import styles from "./index.module.scss";

function Footer(
  props: {
    setLikes: Function;
    likeCount: number;
    post: Post;
    setlikeCount: Function;
  } & StyleHTMLAttributes<HTMLDivElement>
) {
  const { post, setlikeCount, setLikes, likeCount, ...rest } = props;
  const router = useRouter();
  const { currentUser: profile } = usePageContext();
  const [reactionAction, setreactionAction] = useState("");
  const commentRef = useRef<HTMLDivElement>(null);
  const [visibility, setvisibility] = useState<string | null>("Public");
  const { getLocal } = useLocalStorage("visibility");
  const { queryFn } = useQueryFn();
  useEffect(() => {
    setvisibility(getLocal() as string);
  }, [getLocal]);
  const [isLiked, setisLiked] = useState(post.isLiked);

  const { auth, friends, currentUser, dropdownRef } = usePageContext();
  const { id, author: authorAccount, authorId } = post;
  const authorProfile = authorAccount as account["profile"];
  const authorName = `${authorProfile?.firstName ?? "Unknow User"} ${
    authorProfile?.lastName ?? ""
  }`;

  const uid = auth?.currentUser?.uid;
  const postRef = doc(
    db,
    `${getCollectionPath.posts({ uid: String(authorId) })}/${id}`
  );
  const likedUserURL = getCollectionPath.likes({
    authorId: String(authorId),
    postId: String(id),
  });
  const likeRef = doc(db, `${likedUserURL}/${uid}`);
  const likedUserRef = collection(db, likedUserURL);
  useEffect(() => {
    const likedUserRef = collection(db, likedUserURL);
    async function getLikeCount() {
      const likeRef = doc(db, `${likedUserURL}/${uid}`);
      const isLikedPostPromise = getDoc(likeRef);
      const likeCountPromise = getCountFromServer(likedUserRef);
      const [isLikedPostDoc, likeCountDoc] = await Promise.all([
        isLikedPostPromise,
        likeCountPromise,
      ]);
      const isLikedPost = isLikedPostDoc.exists();
      const likeCount = likeCountDoc.data().count;
      setlikeCount?.(likeCount);
      setisLiked(isLikedPost);
    }
    try {
      getLikeCount();
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === "quota-exceeded") {
          alert("Firebase Quota Exceeded. Please try again later.");
          throw error;
        }
      }
      console.error(error);
    }
  }, [authorId, id, likedUserURL, setlikeCount, uid]);
  const [likeLoading, setLikeLoading] = useState(false);
  const [shareAction, setshareAction] = useState("");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!shareAction) return;
      const target = e.target as HTMLDivElement;
      if (dropdownRef && !dropdownRef.current?.contains(target)) {
        setshareAction("");
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownRef, shareAction]);
  // const debounceLikeUnlike = useRef(debounce(handleLikeUnlike(), 1000)).current;
  const [playLikeSound] = useSound(popfx);
  return (
    <div
      // onMouseLeave={() => {
      //   setTimeout(() => {
      //     setreactionAction("");
      //   }, 500);
      // }}
      ref={commentRef}
      {...rest}
      className={styles.action}
    >
      <LikeButton />
      <CommentButton />
      <ShareButton />
    </div>
  );
  function LikeButton() {
    return (
      <div
        className={styles.socialButton} // onMouseEnter={() => {
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
            pointerEvents: likeLoading ? "none" : "initial",
          }}
          onClick={async () => {
            const uid = auth.currentUser?.uid;

            if (!uid) {
              alert("Error : User Not Found . Sign up and Try Again ! ");
              return;
            }

            setisLiked((prev) => !prev);
            setLikeLoading(true);

            if (post.deletedByAuthor) {
              setLikeLoading(false);
              setTimeout(() => {
                setisLiked(false);
              }, 300);
              console.log("Post no longer exist !");
              return;
            }
            queryFn.invalidate("myPost");

            if (isLiked) {
              setLikes([]);
              await unReactPost({ likeCount, postRef, likeRef });
              await updateReactionCount();
            } else {
              playLikeSound();
              setLikes([]);
              await reactPost({
                post,
                profile,
                currentUser,
                postRef,
                likeRef,
                uid,
              });
              await updateReactionCount();
            }

            async function updateReactionCount() {
              setLikeLoading(false);
              const updatedLikeCount = (
                await getCountFromServer(likedUserRef)
              ).data().count;
              setlikeCount?.(updatedLikeCount);
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
    );
  }
  function CommentButton() {
    return (
      <div className={styles.socialButton}>
        <button
          title="Comment"
          tabIndex={-1}
          onClick={(e) => {
            if (router.pathname !== "/") return;

            router.push({
              pathname: `${authorId}/${id?.toString()}`,
            });
          }}
        >
          <FontAwesomeIcon icon={faComment} />
          <p>Comment</p>
        </button>
      </div>
    );
  }
  function ShareButton() {
    return (
      <div className={styles.socialButton}>
        <button
          tabIndex={-1}
          aria-expanded={shareAction !== ""}
          aria-label="open share options"
          title="Share"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            shareAction ? setshareAction("") : setshareAction(String(id));
          }}
        >
          <FontAwesomeIcon icon={faShare} />
          <p>Share </p>
        </button>
        {/* {shareAction && (
          <div
            // onPointerMove={(e) => {
            //   if (shareAction === id) {
            //     e.preventDefault();
            //     return;
            //   }
            // }}
            // onWheel={(e) => {
            //   e.preventDefault();
            //   return;
            // }}
            style={{
              backgroundColor: "black",
              position: "fixed",
              inset: 0,
              opacity: 0.3,
              zIndex:"100"
            }}
          />
        )} */}
        <AnimatePresence>
          {shareAction === id && (
            <motion.div
              ref={dropdownRef}
              key={shareAction === "" ? "true" : "false"}
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: shareAction === id ? 1 : 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
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
                  const shareRef = doc(getPath("posts", { uid }));
                  const sharePost = {
                    refId: shareRef.id,
                    author: authorId.toString(),
                    id: id!,
                  };
                  try {
                    const url = `${uid}/${sharePost.refId}`;
                    await addPost({
                      uid,
                      post: {
                        visibility: visibility ?? "Public",
                      },
                      sharePost,
                      friends: friends!,
                    });
                    await sendAppNoti({
                      uid,
                      receiptId: post?.authorId.toString()!,
                      profile,
                      type: "share",
                      url,
                      content: `${authorName} : ${post.text}`,
                    });
                    setshareAction("");
                    if (uid === authorId) return;

                    try {
                      await sendFCM({
                        image: post.media?.[0] ? post.media?.[0].url : "",
                        recieptId: authorId.toString(),
                        message: `${
                          profile?.displayName ?? "Unknown User"
                        } ${getMessage("share")}`,
                        icon:
                          currentUser?.photoURL_cropped ??
                          currentUser?.photoURL!,
                        tag: `shares-${sharePost.refId}`,
                        link: url,
                      });
                    } catch (error) {
                      console.log(error);
                    }

                    router.replace("/", undefined, { scroll: false });
                  } catch (error: unknown) {
                    alert(error);
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
                  setshareAction("");
                }}
              >
                <FontAwesomeIcon icon={faPen} />
                Write Post
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
}
export default memo(Footer);
