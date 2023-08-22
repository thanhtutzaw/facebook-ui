import {
  faCircleCheck,
  faDotCircle,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { RefObject, useContext, useEffect, useState } from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import { app } from "../../lib/firebase";
import { Post as PostType, likes } from "../../types/interfaces";
import Input from "../Input/Input";
import AdminDropDown from "./AdminDropDown";
import AuthorInfo from "./AuthorInfo";
import DropDown from "./DropDown";
import PhotoLayout from "./PhotoLayout";
import { SharePreview } from "./SharePreview";
import { SocialCount } from "./SocialCount";
import s from "./index.module.scss";
export default function Content(props: {
  Likes: likes;
  setLikes: Function;
  tabIndex?: number;
  updatePost: Function;
  likeCount: number;
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
    Likes,
    setLikes,
    tabIndex,
    updatePost,
    likeCount,
    preventNavigate,
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
  const { authorId, id, text, author, sharePost: share } = post;
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
  const navigateToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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
        {!shareMode && (
          <>
            {!selectMode ? (
              <>
                <button
                  tabIndex={tabIndex}
                  className={s.dot}
                  aria-expanded={showAction !== ""}
                  aria-label="open post option dropdown"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (showAction === "") {
                      setshowAction?.(id?.toString());
                    } else {
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
                          (selectedId) => selectedId.post !== id
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
                      setSelectedId?.([
                        ...selectedId!,
                        {
                          post: id?.toString()!,
                          author: post.authorId.toString(),
                          share: share?.id
                            ? { post: share?.id, author: share?.author }
                            : null,
                        },
                      ]);
                      setChecked(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faDotCircle} />
                  </button>
                )}
              </>
            )}
          </>
        )}
      </AuthorInfo>
      {!shareMode && (
        <>
          {isAdmin ? (
            <AdminDropDown
              updatePost={updatePost!}
              setshowAction={setshowAction!}
              showAction={showAction ?? ""}
              authorId={authorId!}
              id={id?.toString()!}
              post={post}
            />
          ) : (
            <DropDown
              setshowAction={setshowAction!}
              showAction={showAction ?? ""}
              authorId={authorId?.toString()!}
              id={id?.toString()!}
              isSaved={post.isSaved}
              uid={authUser?.uid!}
            />
          )}
        </>
      )}
      <Input
        style={
          {
            // marginBottom: text === "" ? "0" : "5px",
            // paddingTop: text === "" ? "0" : ".5rem",
            // marginBottom: text === "" ? ".5rem" : "1rem",
          }
        }
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
      <PhotoLayout post={post} files={post.media} preview />
      <SharePreview selectMode={selectMode} post={post} />
      {/* {JSON.stringify(post.like)} */}
      <SocialCount
        Likes={Likes}
        setLikes={setLikes}
        likeCount={likeCount}
        post={post}
      />
      {/* {post.likeCount} */}
    </span>
  );
}
