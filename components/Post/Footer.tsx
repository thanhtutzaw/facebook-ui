import useLocalStorage from "@/hooks/useLocalStorage";
import { checkPhotoURL } from "@/lib/firestore/profile";
import { NotiApiRequest } from "@/pages/api/sendFCM";
import {
  faComment,
  faPen,
  faShare,
  faShareFromSquare,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User, getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
} from "firebase/firestore";
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
import { app, db, getCollectionPath, getPath } from "../../lib/firebase";
import {
  getMessage,
  sendAppNoti,
  sendFCM,
} from "../../lib/firestore/notifications";
import { addPost, likePost, unlikePost } from "../../lib/firestore/post";
import { Post, account } from "../../types/interfaces";
import styles from "./index.module.scss";
import popfx from "public/assets/bubble.mp3";
import useSound from "use-sound";
import useQueryFn from "@/hooks/useQueryFn";

export const Footer = (
  props: {
    setLikes?: Function;
    likeCount: number;
    post: Post;
    setlikeCount?: Function;
    currentUser: User | null;
  } & StyleHTMLAttributes<HTMLDivElement>
) => {
  const {
    post,
    currentUser: profile,
    setlikeCount,
    setLikes,
    likeCount,
    ...rest
  } = props;
  const router = useRouter();
  const [reactionAction, setreactionAction] = useState("");
  const commentRef = useRef<HTMLDivElement>(null);
  const [visibility, setvisibility] = useState<string | null>("Public");
  const { getLocal } = useLocalStorage("visibility", visibility);
const {queryFn} = useQueryFn()
  useEffect(() => {
    // setvisibility(localStorage.getItem("visibility")!);
    setvisibility(getLocal());
  }, [getLocal]);
  const [isLiked, setisLiked] = useState(post.isLiked);

  const { currentUser, queryClient, dropdownRef, shareAction, setshareAction } =
    useContext(PageContext) as PageProps;
  const { id, author: authorAccount, authorId } = post;
  const authorProfile = authorAccount as account["profile"];
  const authorName = `${authorProfile?.firstName ?? "Unknow User"} ${
    authorProfile?.lastName ?? ""
  }`;

  const auth = getAuth(app);
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
      const isUserLikeThisPost = uid ? (await getDoc(likeRef)).exists() : false;
      const likeCount = (await getCountFromServer(likedUserRef)).data().count;
      setlikeCount?.(likeCount);
      setisLiked(isUserLikeThisPost);
    }
    try {
      getLikeCount();
    } catch (error: any) {
      if (error.code === "quota-exceeded") {
        alert("Firebase Quota Exceeded. Please try again later.");
        throw error;
      }
      console.error(error);
    }
  }, [authorId, id, likedUserURL, setlikeCount, uid]);
  const [likeLoading, setLikeLoading] = useState(false);
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
            pointerEvents: likeLoading ? "none" : "initial",
          }}
          onClick={async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) {
              alert("Error : User Not Found . Sign up and Try Again ! ");
              return;
            }
            setisLiked((prev) => !prev);
            queryFn.invalidate("myPost");
            setLikeLoading(true);
            if (isLiked) {
              setLikes?.([]);
              await unlikePost(likeCount ?? 0, postRef, likeRef);
              await updateLikeState();
            } else {
              playLikeSound();
              setLikes?.([]);
              await likePost(postRef, likeRef, uid);
              await updateLikeState();
              if (uid === authorId) return;
              await sendAppNoti({
                uid,
                receiptId: authorId,
                profile,
                type: "post_reaction",
                url: `${authorId}/${id}`,
              });
              try {
                await sendFCM({
                  recieptId: authorId.toString(),
                  message: `${profile?.displayName ?? "Unknown User"} ${
                    getMessage("post_reaction").message
                  }`,
                  icon: checkPhotoURL(
                    currentUser?.photoURL_cropped ?? currentUser?.photoURL
                  ),
                  tag: `Likes-${id}`,
                  link: `/${authorId}/${id}`,
                });
              } catch (error) {
                console.log(error);
              }
            }
            async function updateLikeState() {
              setLikeLoading(false);
              const likes = (await getCountFromServer(likedUserRef)).data()
                .count;
              setlikeCount?.(likes);
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
          {/* {`isLike-${post.isLiked ? "true" : "false"}`}
          <br />
          {`likedstate-${isLiked ? "true" : "false"}`} */}
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
                    window.document.body.style.cursor = "wait";
                    const url = `${uid}/${sharePost.refId}`;
                    await addPost({
                      uid,
                      post: {
                        visibility: visibility ?? "Public",
                      },
                      sharePost,
                    });

                    await sendAppNoti({
                      uid,
                      receiptId: post?.authorId.toString()!,
                      profile,
                      type: "share",
                      url,
                      content: `${authorName} : ${post.text}`,
                    });

                    if (uid === authorId) return;

                    try {
                      const body: NotiApiRequest["body"] = {
                        recieptId: authorId.toString(),
                        message: `${profile?.displayName ?? "Unknown User"} ${
                          getMessage("share").message
                        }`,
                        icon:
                          currentUser?.photoURL_cropped ??
                          currentUser?.photoURL!,
                        tag: `shares-${sharePost.refId}`,
                        link: url,
                      };
                      await sendFCM(body);
                    } catch (error) {
                      console.log(error);
                    }

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
    </div>
  );
};

// async function handleShareNow(
//   currentUser: any,
//   uid: string,
//   visibility: string,
//   sharePost: { refId: string; author: string; id: string },
//   post: Post,
//   profile: User | null,
//   authorName: string
// ) {}
