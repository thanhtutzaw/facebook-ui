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
import { StyleHTMLAttributes, useContext, useState } from "react";
import styles from "./index.module.scss";
import { PageContext, PageProps } from "../../context/PageContext";

export function Footer(
  props: {
    postId?: string;
    tabIndex?: number;
  } & StyleHTMLAttributes<HTMLDivElement>
) {
  const { postId, tabIndex } = props;
  const { shareAction, setshareAction } = useContext(PageContext) as PageProps;
  return (
    <div {...props} className={styles.action}>
      <button tabIndex={tabIndex}>
        <FontAwesomeIcon icon={faThumbsUp} />
        <p>Like</p>
      </button>
      <button tabIndex={tabIndex}>
        <FontAwesomeIcon icon={faComment} />
        <p>Comment</p>
      </button>
      <button
        tabIndex={tabIndex}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setshareAction?.(postId?.toString()!);

          if (shareAction === postId) {
            setshareAction?.("");
          }
        }}
      >
        <FontAwesomeIcon icon={faShare} />
        <p>Share</p>
      </button>
      <AnimatePresence>
        {shareAction === postId && (
          <motion.div
            key={postId}
            initial={{
              opacity: "0",
              scale: 0.8,
            }}
            animate={{
              opacity: shareAction === postId ? 1 : 0,
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
                alert(postId);
                // savedPost.push({ authorId: authorId, postId: postId });
              }}
            >
              <FontAwesomeIcon icon={faShareFromSquare} />
              Share Now
            </button>
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                // savedPost.push({ authorId: authorId, postId: postId });
              }}
            >
              <FontAwesomeIcon icon={faPen} />
              Write Post
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* <DropDown
        setshareAction={setshareAction!}
        shareAction={shareAction ?? ""}
        // authorId={authorId.toString()!}
        postId={postId?.toString()!}
      /> */}
    </div>
  );
}
