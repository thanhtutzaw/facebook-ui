import { faBookmark, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { app, db } from "../../lib/firebase";
import { addSavedPost, unSavePost } from "../../lib/firestore/savedPost";
import styles from "./index.module.scss";
import { deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/router";
export default function DropDown(props: {
  setshowAction: Function;
  showAction: string;
  authorId: string;
  id: string;
  uid: string;
  isSaved: boolean;
}) {
  const { uid, isSaved, setshowAction, authorId, id, showAction } = props;
  const [loading, setLoading] = useState(false);
  const [saveToggle, setsaveToggle] = useState(isSaved);
  const router = useRouter();
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
            className={`${saveToggle ? styles.active : ""}`}
            disabled={loading}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!saveToggle) {
                setLoading(true);
                setsaveToggle(true);
                try {
                  setLoading(true);
                  await addSavedPost(authorId, id);
                } catch (error: any) {
                  alert(error.message);
                  setLoading(false);
                } finally {
                  setLoading(false);
                }
              } else {
                const savedByUserRef = doc(db, `users/${uid}/savedPost/${id}`);
                await unSavePost(savedByUserRef);
                setsaveToggle(false);
                if (router.pathname !== "/") {
                  router.replace(router.asPath);
                }
              }
              setshowAction("");
            }}
          >
            <FontAwesomeIcon icon={faBookmark} />
            {saveToggle ? "Unsave Post" : "Save Post"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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
