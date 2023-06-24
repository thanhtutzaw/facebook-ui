import {
  faCircleCheck,
  faDotCircle,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import router, { useRouter } from "next/router";
import { RefObject, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Post, Props } from "../../types/interfaces";
import Actions from "./Actions";
import PhotoLayout from "./PhotoLayout";
import styles from "./Post.module.scss";
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
  const {
    preventClick,
    selectedId,
    setSelectedId,
    email,
    showAction,
    setshowAction,
    uid,
  } = useContext(AppContext) as Props;
  const router = useRouter();
  const seemore =
    text.match(/<br\s*[/]?>/gi)?.length! > 4 ||
    text.match(/<div\s*[/]?>/gi)?.length! > 2
      ? `<button  tabindex="-1" class="seeMore">${
          showmore ? "See Less" : "See more"
        }</button>`
      : "";
  const textContent =
    text.match(/<br\s*[/]?>/gi)?.length! >= (!showmore ? 3 : Infinity) ||
    text.match("<span>")?.length! >= 2
      ? text.replaceAll("<div>", "<br>").substring(0, 50)
      : text;

  const production = process.env.NODE_ENV == "production" ? true : false;
  return (
    <span
      style={{
        display: "block",
        pointerEvents: preventClick ? "none" : "initial",
      }}
      onClick={(e) => {
        if (!active) {
          router.push({
            pathname: `${authorId}/${id?.toString()}`,
          });
        } else {
          !checked ? checkRef.current?.click() : uncheckRef.current?.click();
        }
      }}
    >
      {/* <div className={styles.header}>
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
            <p
              className={styles.name}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                // router.push(post.authorId?.toString());
                router.push({
                  pathname: `${authorId}`,
                });
              }}
            >
              {authorId === "rEvJE0sb1yVJxfHTbtn915TSfqJ2"
                ? "Peter 1"
                : "Other User"}
            </p>
            <p suppressHydrationWarning>
              {new Timestamp(createdAt.seconds, createdAt.nanoseconds)
                .toDate()
                .toLocaleDateString()}
            </p>
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
      </div> */}

      <Actions
        showAction={showAction ?? ""}
        authorId={authorId!}
        id={id!.toString()}
      />
      {/* <div
        role="textbox"
        contentEditable="false"
        suppressContentEditableWarning={true}
        className={styles.text}
        // dangerouslySetInnerHTML={{ __html: text }}
        // dangerouslySetInnerHTML={{
        //   __html: client ? textContent + seemore : "",
        // }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === "A") {
            e.stopPropagation();
          }
          if (target.tagName === "BUTTON") {
            e.stopPropagation();
            e.preventDefault();
            setShowmore((prev: boolean) => !prev);
            console.log(showmore);
          }
        }}
      >
        {text}
      </div> */}

      {/* <div
        suppressHydrationWarning={true}
        role="textbox"
        contentEditable="false"
        suppressContentEditableWarning={true}
        className={styles.text}
        // dangerouslySetInnerHTML={{ __html: textContent + seemore }}
        dangerouslySetInnerHTML={{
          __html: !production
            ? client
              ? textContent + seemore
              : ""
            : textContent + seemore,
        }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === "A") {
            e.stopPropagation();
          }
          if (target.tagName === "BUTTON") {
            e.stopPropagation();
            e.preventDefault();
            setShowmore((prev: boolean) => !prev);
            console.log(showmore);
          }
        }}
      /> */}

      {/* {text.replace(/<br\s*\/?>/g, "\n").replaceAll("<div>", "\n")} */}
      {/* {text.match(/<br\s*[/]?>/gi)?.length} */}
      {/* {text.match(/<br\s*[/]?>/gi)?.length! >= (!showmore ? 3 : Infinity)
          ? text
              .replace(/<br\s*\/?>/g, "\n")
              .replaceAll("<div>", "\n")
              .substring(0, text.length / text.match(/<br\s*[/]?>/gi)?.length!)
          : text.replace(/<br\s*\/?>/g, "\n").replaceAll("<div>", "\n")} */}

      {/* {text
      .replace(/<br\s*\/?>/g, "\n")
      .replaceAll("<div>", "")
      .replaceAll("</div>", "")
      .replaceAll("&nbsp;", " ")} */}
      <h5>{post.media?.length}</h5>
      <li>{post.media?.[0]?.url}</li>
      <li>{post.media?.[1]?.url}</li>
      <li>{post.media?.[2]?.url}</li>
      <PhotoLayout files={post.media} preview />
    </span>
  );
}
