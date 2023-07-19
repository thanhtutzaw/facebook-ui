import {
  faComment,
  faPen,
  faShare,
  faShareAlt,
  faShareAltSquare,
  faShareFromSquare,
  faThumbsUp,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import {
  RefObject,
  StyleHTMLAttributes,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./index.module.scss";
import { PageContext, PageProps } from "../../context/PageContext";
import { Post } from "../../types/interfaces";
import { useRouter } from "next/router";
import { addPost } from "../../lib/firestore/post";
import { getAuth } from "firebase/auth";
import { app } from "../../lib/firebase";

export function Footer(
  props: {
    post: Post;
    tabIndex?: number;
  } & StyleHTMLAttributes<HTMLDivElement>
) {
  const { post, tabIndex, ...rests } = props;
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

  return (
    <div ref={commentRef} {...rests} className={styles.action}>
      <button tabIndex={-1}>
        <FontAwesomeIcon icon={faThumbsUp} />
        <p>Like</p>
      </button>
      <button
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
      <button
        style={
          {
            // overflow: "hidden",
            // zIndex: shareAction === id ? "100" : "initial",
          }
        }
        tabIndex={-1}
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
  );
}
