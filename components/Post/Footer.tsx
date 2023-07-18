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
        <p>Share</p>
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
                alert(id);
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
