import {
  faCircleCheck,
  faDotCircle,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Timestamp } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { RefObject, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import Actions from "./Actions";
import styles from "./Post.module.scss";
import { Post, Props } from "../../types/interfaces";
import { useRouter } from "next/router";
export default function Content(props: {
  active: boolean;
  checked: boolean;
  photoURL: string;
  client: boolean;
  uncheckRef: RefObject<HTMLButtonElement>;
  setChecked: Function;
  checkRef: RefObject<HTMLButtonElement>;
  showmore: boolean;
  setShowmore: Function;
  post: Post;
}) {
  const {
    active,
    checked,
    photoURL,
    client,
    uncheckRef,
    setChecked,
    checkRef,
    showmore,
    setShowmore,
    post,
  } = props;
  const { authorId, id, text, visibility, createdAt } = post;
  const { selectedId, setSelectedId, email, showAction, setshowAction, uid } =
    useContext(AppContext) as Props;
  const router = useRouter();
  return (
    <span
      style={{
        display: "block",
        padding: "0 0 1rem",
      }} // scroll={false}
      // href={`${authorId}/${id?.toString()}`}
      onClick={(e) => {
        if (!active) {
          // if(e.target.tagName)
          // e.preventDefault();
          // e.stopPropagation();
          router.push({
            pathname: `${authorId}/${id?.toString()}`,
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
            style={{
              objectFit: "cover",
            }}
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
              {client &&
                new Timestamp(createdAt.seconds, createdAt.nanoseconds)
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
                className={styles.dot}
                whileTap={{
                  scale: 1.3,
                }}
                whileHover={{
                  opacity: 0.8,
                }}
                aria-expanded={showAction !== ""}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setshowAction?.(id?.toString());

                  if (showAction === id) {
                    setshowAction?.("");
                  }
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
                    selectedId?.filter(
                      (selectedId: string) => selectedId !== id
                    )
                  );
                }}
              >
                <FontAwesomeIcon icon={faCircleCheck} />
              </button>
            ) : (
              <button
                aria-label="select post"
                style={{
                  opacity: ".3",
                }}
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
            <Actions
              authorId={authorId!}
              id={id!.toString()}
              setshowAction={setshowAction!}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div
        role="textbox"
        contentEditable="false"
        suppressContentEditableWarning={true}
        className={styles.text} // dangerouslySetInnerHTML={{ __html: client ? replace : "" }}
        dangerouslySetInnerHTML={{ __html: client ? text : "" }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === "A") {
            e.stopPropagation();
          }
        }}
      >
        {/* {text.replace(/<br\s*\/?>/g, "\n").replaceAll("<div>", "\n")} */}
        {/* {text.match(/<br\s*[/]?>/gi)?.length} */}
        {/* {text.match(/<br\s*[/]?>/gi)?.length! >= (!showmore ? 3 : Infinity)
          ? text
              .replace(/<br\s*\/?>/g, "\n")
              .replaceAll("<div>", "\n")
              .substring(0, text.length / text.match(/<br\s*[/]?>/gi)?.length!)
          : text.replace(/<br\s*\/?>/g, "\n").replaceAll("<div>", "\n")} */}
        {/* {text.match(/<br\s*[/]?>/gi)?.length! > 4 ||
          (text.match(/<div\s*[/]?>/gi)?.length! > 2 && (
            <button
              tabIndex={-1}
              className={styles.seeMore}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowmore((prev: boolean) => !prev);
              }}
            >
              {!showmore ? "See more" : "See less"}
            </button>
          ))} */}

        {/* {replace} */}
        {/* {text
      .replace(/<br\s*\/?>/g, "\n")
      .replaceAll("<div>", "")
      .replaceAll("</div>", "")
      .replaceAll("&nbsp;", " ")} */}
      </div>
    </span>
  );
}
