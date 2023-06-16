import {
  faCircleCheck,
  faDotCircle,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Timestamp } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  MouseEvent,
  MouseEventHandler,
  RefObject,
  useContext,
  useEffect,
} from "react";
import { AppContext } from "../../context/AppContext";
import Actions from "./Actions";
import styles from "./Post.module.scss";
import { Post, Props } from "../../types/interfaces";
import { useRouter } from "next/router";
import PhotoLayout from "./PhotoLayout";
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
  const { authorId, id, text, visibility, createdAt, media } = post;
  const { selectedId, setSelectedId, email, showAction, setshowAction, uid } =
    useContext(AppContext) as Props;
  const router = useRouter();
  // useEffect(() => {
  //   const handleClick = (e: { currentTarget: { innerText: string } }) => {
  //     // e.preventDefault();
  //     // e.stopPropagation();
  //     console.log(seeMore);
  //     setShowmore((prev: any) => !prev);
  //     e.currentTarget.innerText = "hello";
  //   };

  //   const seeMore = document.getElementsByClassName(
  //     "seeMore"
  //   )[0] as HTMLButtonElement;
  //   if (seeMore && ) {
  //     seeMore.addEventListener("click", handleClick);
  //   }

  //   return () => {
  //     if (seeMore) {
  //       seeMore.removeEventListener("click", handleClick);
  //     }
  //   };
  // }, [setShowmore]);
  const seemore =
    text.match(/<br\s*[/]?>/gi)?.length! > 4 ||
    text.match(/<div\s*[/]?>/gi)?.length! > 2
      ? `<button  tabindex="-1" class="seeMore">See more</button>`
      : "";
  // const seemore = `<button onclick="event.preventDefault(); event.stopPropagation(); event.currentTarget.innerText='See less'; " tabindex="-1" class="seeMore">See more</button>`;
  //   const seemore = `
  // <button tabIndex={-1} className={styles.seeMore}
  //               onClick={(e) => {
  //                 e.preventDefault();
  //                 e.stopPropagation();
  //                 setShowmore((prev: boolean) => !prev);
  //               }}
  //             >
  //               {!showmore ? "See more" : "See less"}
  //             </button>
  // `;
  const textContent =
    text.match(/<br\s*[/]?>/gi)?.length! >= (!showmore ? 3 : Infinity)
      ? text.replaceAll("<div>", "<br>").substring(0, 50) + seemore
      : text + `<button  tabindex="-1" class="seeMore">See less</button>`;

  // const textContent =
  //   text.match(/<br\s*[/]?>/gi)?.length! >= (!showmore ? 3 : Infinity)
  //     ? text
  //         .replaceAll("<div>", "\n")
  //         .substring(0, text.length / text.match(/<br\s*[/]?>/gi)?.length!) +
  //       `<button>hi</button>`
  //     : text + `<button>hi</button>`;
  return (
    <span
      style={{
        display: "block",
        // padding: "0 0 1rem",
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
        <div className={styles.authorInfo}>
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
              <button
                className={styles.dot}
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
              </button>
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
        dangerouslySetInnerHTML={{
          __html: client
            ? textContent
            : // +
              //   (text.match(/<br\s*[/]?>/gi)?.length! > 4 ||
              //   text.match(/<div\s*[/]?>/gi)?.length! > 2
              //     ? `<button>See More</button>`
              //     : `<button>end</button>`)
              "",
        }}
        // `<button onclick="event.preventDefault(); event.stopPropagation();" tabindex="-1" class="seeMore">
        //                ${!showmore ? "Show More" : "Show Less"}  </button>`
        onClick={(e) => {
          const target = e.target as HTMLElement;
          console.log(target.tagName);
          // alert("hey");
          if (target.tagName === "A") {
            e.stopPropagation();
          }
          if (target.tagName === "BUTTON") {
            e.stopPropagation();
            e.preventDefault();
            // console.log(target.tagName);
            setShowmore((prev: boolean) => !prev);
            console.log(showmore);
            if (showmore) {
              target.innerText = "Show less";
            } else {
              target.innerText = "Show more";
            }
          }
        }}
      >
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
        {/* {text.replace(/<br\s*\/?>/g, "\n").replaceAll("<div>", "\n")} */}
        {/* {text.match(/<br\s*[/]?>/gi)?.length} */}
        {/* {text.match(/<br\s*[/]?>/gi)?.length! >= (!showmore ? 3 : Infinity)
          ? text
              .replace(/<br\s*\/?>/g, "\n")
              .replaceAll("<div>", "\n")
              .substring(0, text.length / text.match(/<br\s*[/]?>/gi)?.length!)
          : text.replace(/<br\s*\/?>/g, "\n").replaceAll("<div>", "\n")} */}

        {/* {replace} */}
        {/* {text
      .replace(/<br\s*\/?>/g, "\n")
      .replaceAll("<div>", "")
      .replaceAll("</div>", "")
      .replaceAll("&nbsp;", " ")} */}
      </div>
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
      <PhotoLayout files={post.media} preview />
    </span>
  );
}
