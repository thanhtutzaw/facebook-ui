import { usePostContext } from "@/context/PostContext";
import { db, getCollectionPath } from "@/lib/firebase";
import { addSavedPost, unSavePost } from "@/lib/firestore/savedPost";
import { faBookmark, faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { doc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "../index.module.scss";
export default function Menu(props: {
  authorId: string;
  id: string;
  uid: string;
  isSaved: boolean;
}) {
  const { uid, isSaved, authorId, id } = props;
  const { toggleMenu, settoggleMenu } = usePostContext();
  const [loading, setLoading] = useState(false);
  const [saveToggle, setsaveToggle] = useState(isSaved);
  const router = useRouter();
  return (
    <AnimatePresence>
      {toggleMenu === id && (
        <motion.div
          key={id}
          initial={{
            opacity: "0",
            scale: 0.8,
          }}
          animate={{
            opacity: toggleMenu === id ? 1 : 0,
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
            settoggleMenu={settoggleMenu}
            toggleMenu={toggleMenu}
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
                } catch (error: unknown) {
                  alert(error);
                  setLoading(false);
                } finally {
                  setLoading(false);
                }
              } else {
                const savedByUserRef = doc(
                  db,
                  `${getCollectionPath.savedPost({ uid })}/${id}`
                );
                await unSavePost(savedByUserRef);
                setsaveToggle(false);
                if (router.pathname !== "/") {
                  router.replace(router.asPath);
                }
              }
              settoggleMenu("");
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
  settoggleMenu: Dispatch<SetStateAction<string>>;
  toggleMenu: string;
  authorId: string;
  id: string;
}) {
  const [copied, setcopied] = useState(false);
  const { settoggleMenu, toggleMenu, authorId, id } = props;
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (copied) {
        setcopied(false);
        settoggleMenu("");
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [copied, settoggleMenu]);

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
        <FontAwesomeIcon icon={faLink} />
        Copy Link
      </button>
      {copied && (
        <div style={{ position: "fixed", inset: "0", pointerEvents: "none" }}>
          <button className="copied">Copied</button>
        </div>
      )}
    </>
  );
}
