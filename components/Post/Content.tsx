import {
  faCircleCheck,
  faDotCircle,
  faEarth,
  faEllipsisH,
  faGlobe,
  faLock,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import { RefObject, useContext, useEffect, useState } from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import { Post as PostType } from "../../types/interfaces";
import Actions from "./AdminDropDown";
import PhotoLayout from "./PhotoLayout";
import s from "./index.module.scss";
import AuthorInfo from "./AuthorInfo";
import { app } from "../../lib/firebase";
import AdminDropDown from "./AdminDropDown";
import DropDown from "./DropDown";
import SharePostFallback from "./SharePostFallback";
import { SharePreview } from "./SharePreview";
import { SocialCount } from "./SocialCount";
import Input from "../Input/Input";
export default function Content(props: {
  shareMode?: boolean;
  preventNavigate?: boolean;
  selectMode: boolean;
  checked: boolean;
  client: boolean;
  uncheckRef: RefObject<HTMLButtonElement>;
  setChecked: Function;
  checkRef: RefObject<HTMLButtonElement>;
  showmore: boolean;
  setShowmore: Function;
  post: PostType;
  auth: User;
}) {
  const {
    preventNavigate,
    auth,
    selectMode,
    checked,
    client,
    uncheckRef,
    setChecked,
    checkRef,
    showmore,
    setShowmore,
    post,
    shareMode,
  } = props;
  const { author, authorId, id, text, visibility, createdAt } = post;
  const { preventClick, selectedId, setSelectedId, showAction, setshowAction } =
    useContext(PageContext) as PageProps;
  const router = useRouter();
  const seemore =
    text?.match(/<br\s*[/]?>/gi)?.length! > 4 ||
    text?.match(/<div\s*[/]?>/gi)?.length! > 2
      ? `<button  tabindex="-1" class="seeMore">${
          showmore ? "See Less" : "See more"
        }</button>`
      : "";
  const textContent =
    text?.match(/<br\s*[/]?>/gi)?.length! >= (!showmore ? 3 : Infinity) ||
    text?.match("<span>")?.length! >= 2
      ? text?.replaceAll("<div>", "<br>").substring(0, 50)
      : text;

  const production = process.env.NODE_ENV == "production";
  // const production = process.env.NODE_ENV == "production" ? true : false;
  const navigateToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // alert(router.query.post);
    const isViewingAuthorProfile =
      authorId === router.query.user ||
      (router.query.user && router.query.post);
    if (isViewingAuthorProfile || preventNavigate) return;
    router.push({
      pathname: `${authorId}`,
    });
  };
  const [authUser, setauthUser] = useState<User | null>(null);
  useEffect(() => {
    const auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      setauthUser(user);
    });
  }, []);
  const isAdmin = authUser?.uid === authorId;

  return (
    <span
      style={{
        display: "block",
        pointerEvents: preventClick || shareMode ? "none" : "initial",
      }}
      onClick={(e) => {
        if (!selectMode) {
          router.push({
            pathname: `${authorId}/${id?.toString()}`,
          });
        } else {
          !checked ? checkRef.current?.click() : uncheckRef.current?.click();
        }
      }}
    >
      <AuthorInfo navigateToProfile={navigateToProfile} post={post}>
        {!selectMode ? (
          <>
            <button
              className={s.dot}
              aria-expanded={showAction !== ""}
              aria-label="open post option dropdown"
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
          </>
        ) : (
          <>
            {checked ? (
              <button
                aria-label="deselect post"
                ref={uncheckRef}
                className={s.check}
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
      </AuthorInfo>
      {/* {JSON.stringify(post, null, 4)} */}
      {isAdmin ? (
        <AdminDropDown
          setshowAction={setshowAction!}
          showAction={showAction ?? ""}
          authorId={authorId!}
          id={id?.toString()!}
        />
      ) : (
        <DropDown
          setshowAction={setshowAction!}
          showAction={showAction ?? ""}
          authorId={authorId?.toString()!}
          id={id?.toString()!}
        />
      )}
      <Input
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
          }
        }}
        className={s.text}
        suppressContentEditableWarning={true}
        suppressHydrationWarning={true}
        role="textbox"
        contentEditable={false}
      />
      <PhotoLayout files={post.media} preview />
      <SharePreview post={post} />

      <SocialCount post={post} />
    </span>
  );
}
