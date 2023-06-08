import {
  faCircleCheck,
  faComment,
  faDotCircle,
  faEllipsisH,
  faShare,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Timestamp } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AppContext } from "../../context/AppContext";
import { Post as PostType, Props } from "../../types/interfaces";
import Actions from "./Actions";
import styles from "./Post.module.scss";
import Image from "next/image";
import Link from "next/link";
import { set } from "nprogress";
import { text } from "@fortawesome/fontawesome-svg-core";
// import { Post } from "../../types/interfaces";
// type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
// interface Props {
//   post: Post;
// }
interface PostProps {
  active?: boolean;
  post: PostType;
  tabIndex: number;
}
export default function Post({ active, post, tabIndex }: PostProps) {
  const { authorId, id, text, visibility, createdAt } = post;
  const [Bounce, setBounce] = useState(false);

  // const date = createdAt ? createdAt?.toDate().toLocaleDateString() : 0;
  const [checked, setChecked] = useState(false);
  const checkRef = useRef<HTMLButtonElement>(null);
  const uncheckRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const photoURL = "";
  const {
    selectedId,
    setSelectedId,
    email,
    active: tab,
    showAction,
    setshowAction,
    uid,
  } = useContext(AppContext) as Props;

  useEffect(() => {
    if (active) {
      showAction && setshowAction?.("");
    } else {
      checked && setChecked(false);
    }
  }, [active, checked, setshowAction, showAction]);

  const dateString = useRef("");
  const timeString = new Timestamp(createdAt.seconds, createdAt.nanoseconds)
    .toDate()
    .toLocaleDateString();
  // useLayoutEffect(() => {
  //   const date = new Timestamp(createdAt.seconds, createdAt.nanoseconds);
  //   dateString.current = date.toDate().toLocaleDateString();
  // }, [createdAt.nanoseconds, createdAt.seconds]);

  useEffect(() => {
    if (tab !== "profile" || "") {
      setshowAction?.("");
    }
    // if (tab !== "") {
    //   setshowAction?.("");
    // }
  }, [setshowAction, tab]);
  // var patt2 = new RegExp("<div>", "g");
  // var patt3 = new RegExp("</div>", "g");
  // var patt4 = new RegExp("<br>", "g");
  // const replace = text.replace("<div>", "").replaceAll("</div><div>", "<br>");
  // const [client, setclient] = useState(false);
  // useEffect(() => {
  //   setclient(true);
  // }, []);

  return (
    <div
      className={styles.post}
      style={{
        transition: "all .1s ease-in-out",
        borderRadius: checked ? "50px" : "0",
        border: checked ? "10px solid #0070f312" : "0px solid #0070f312",
        // backgroundColor: checked ? "rgb(223 255 220)" : "",
        userSelect: active ? "none" : "initial",
        cursor: active ? "pointer" : "initial",
      }}
    >
      <span
        style={{
          display: "block",
          padding: "0 0 1rem",
        }}
        // scroll={false}
        // href={`${authorId}/${id?.toString()}`}
        onClick={() => {
          if (!active) {
            router.push({
              pathname: `${authorId}/${id?.toString()}`,
              // query: { edit: false },
            });
          } else {
            !checked ? checkRef.current?.click() : uncheckRef.current?.click();
          }
        }}
      >
        <div className={styles.header}>
          <div className={styles.left}>
            <Image
              priority={false}
              className={styles.profile}
              alt={email ?? " "}
              width={200}
              height={200}
              style={{ objectFit: "cover" }}
              src={
                authorId === "rEvJE0sb1yVJxfHTbtn915TSfqJ2"
                  ? "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
                  : photoURL
                  ? photoURL
                  : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
              }
            />
            <div>
              <p>
                {authorId === "rEvJE0sb1yVJxfHTbtn915TSfqJ2"
                  ? "Peter 1"
                  : "Other User"}
              </p>
              <p>
                {new Timestamp(createdAt.seconds, createdAt.nanoseconds)
                  .toDate()
                  .toLocaleDateString()}
              </p>
              {/* <p>{visibility?.[0] === "public" ? "hi" : visibility}</p> */}
              <p>{visibility}</p>
            </div>
          </div>
          {!active ? (
            <>
              {uid === authorId && (
                <motion.button
                  whileTap={{ scale: 1.3 }}
                  whileHover={{ opacity: 0.8 }}
                  aria-expanded={showAction !== ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    setshowAction?.(id?.toString());
                    if (showAction === id) {
                      setshowAction?.("");
                    }
                    // alert(showAction);
                  }}
                >
                  <FontAwesomeIcon icon={faEllipsisH} />
                </motion.button>
              )}
            </>
          ) : (
            <>
              {checked ? (
                <button
                  aria-label="deselect post"
                  ref={uncheckRef}
                  className={styles.check}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setChecked(false);
                    setSelectedId?.(
                      selectedId?.filter((selectedId) => selectedId !== id)
                    );
                  }}
                >
                  <FontAwesomeIcon icon={faCircleCheck} />
                </button>
              ) : (
                <button
                  aria-label="select post"
                  style={{ opacity: ".3" }}
                  ref={checkRef}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedId?.([...selectedId!, id?.toString()]);
                    setChecked(true);
                  }}
                >
                  <FontAwesomeIcon icon={faDotCircle} />
                </button>
              )}
            </>
          )}
        </div>
        <AnimatePresence>
          {showAction === id && (
            <motion.div
              key={id}
              initial={{ opacity: "0", scale: 0.8 }}
              animate={{ opacity: showAction === id ? 1 : 0, scale: 1 }}
              exit={{ opacity: "0", scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className={styles.actions}
            >
              <Actions
                authorId={authorId!}
                id={id!}
                setshowAction={setshowAction!}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div
          role="textbox"
          contentEditable="false"
          suppressContentEditableWarning={true}
          className={styles.text}
          // dangerouslySetInnerHTML={{ __html: client ? replace : "" }}
          // dangerouslySetInnerHTML={{ __html: text }}
        >
          {text.replace(/<br\s*\/?>/g, "\n").replaceAll("<div>", "\n")}
          {/* {replace} */}
          {/* {text
            .replace(/<br\s*\/?>/g, "\n")
            .replaceAll("<div>", "")
            .replaceAll("</div>", "")
            .replaceAll("&nbsp;", " ")} */}
        </div>
      </span>
      <div className={styles.action}>
        <button tabIndex={tabIndex}>
          <FontAwesomeIcon bounce={Bounce} icon={faThumbsUp} />
          <p>Like</p>
        </button>
        <button tabIndex={tabIndex}>
          <FontAwesomeIcon icon={faComment} bounce={Bounce} />

          <p>Comment</p>
        </button>
        <button tabIndex={tabIndex}>
          <FontAwesomeIcon icon={faShare} bounce={Bounce} />
          <p>Share</p>
        </button>
      </div>
    </div>
  );
}
