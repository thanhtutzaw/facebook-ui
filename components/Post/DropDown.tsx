import {
  faCopy,
  faEdit,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import router from "next/router";
import { app } from "../../lib/firebase";
import { deletePost } from "../../lib/firestore/post";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./index.module.scss";
import { addSavedPost } from "../../lib/firestore/savedPost";
import link from "next/link";
function DropDown(props: {
  setshowAction: Function;
  showAction: string;
  authorId: string;
  id: string;
}) {
  const { setshowAction, authorId, id, showAction } = props;
  const auth = getAuth(app);
  const [loading, setLoading] = useState(false);
  return (
    <AnimatePresence>
      {showAction === id && (
        <motion.div
          key={id}
          initial={{
            opacity: "0",
            scale: 0.8,
          }}
          animate={{
            opacity: showAction === id ? 1 : 0,
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
        >
          <CopyLink
            setshowAction={setshowAction}
            showAction={showAction}
            authorId={authorId.toString()}
            id={id.toString()}
          />
          <button
            disabled={loading}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              // const savedPost = [];
              // savedPost.push({ authorId: authorId, postId: id });

              setLoading(true);
              try {
                setLoading(true);
                await addSavedPost(authorId, id);
              } catch (error: any) {
                alert(error.message);
                setLoading(false);
              } finally {
                setLoading(false);
                window.document.body.style.cursor = "initial";
              }
              // alert(JSON.stringify(savedPost));
            }}
          >
            <FontAwesomeIcon icon={faSave} />
            Save Post
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DropDown;

export function CopyLink(props: {
  setshowAction: Function;
  showAction: string;
  authorId: string;
  id: string;
}) {
  const [copied, setcopied] = useState(false);
  const { setshowAction, showAction, authorId, id } = props;
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (copied) {
        setcopied(false);
        setshowAction(false);
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [copied, setshowAction]);

  return (
    <>
      <button
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const link = `https://facebook-ui-zee.vercel.app/${authorId}/${id}`;
          navigator.clipboard.writeText(link);
          setcopied(true);
        }}
      >
        <FontAwesomeIcon icon={faCopy} />
        Copy Link
      </button>
      {copied && <button className="copied">Copied</button>}
    </>
  );
}
