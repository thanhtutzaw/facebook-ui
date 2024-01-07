import { usePageContext } from "@/context/PageContext";
import { usePostContext } from "@/context/PostContext";
import useEscape from "@/hooks/useEscape";
import { app, getCollectionPath } from "@/lib/firebase";
import { Post } from "@/types/interfaces";
import {
  faCircleCheck,
  faDotCircle,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";
import TextInput from "../Form/Input/TextInput";
import AuthorInfo from "./AuthorInfo";
import PostFallback from "./Fallback";
import AdminMenu from "./Menu/AdminMenu";
import Menu from "./Menu/Menu";
import PhotoLayout from "./PhotoLayout";
import { SharePreview } from "./SharePreview";
import { SocialCount } from "./SocialCount";
import s from "./index.module.scss";
function Content({ post }: { post: Post }) {
  const {
    deletePost,
    Likes,
    setLikes,
    tabIndex,
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
    shareMode,
    toggleMenu,
    settoggleMenu,
  } = usePostContext();
  const { authorId, id, text, sharePost: share } = post;
  const { preventClick, selectedId, setSelectedId } = usePageContext();
  useEscape(() => {
    if (toggleMenu) settoggleMenu("");
  });
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
  const navigateToProfile = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const { user, post } = router.query;
      const isViewingAuthorProfile = authorId === user || (user && post);
      if (isViewingAuthorProfile || preventNavigate) return;

      if (router.pathname === "/") {
        router.push(
          {
            query: {
              user: String(authorId),
            },
          },
          String(authorId)
        );
      } else {
        router.push(`/${String(authorId)}`);
      }
    },
    [authorId, preventNavigate, router]
  );
  const [authUser, setauthUser] = useState<User | null>(null);
  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (user) => {
      setauthUser(user);
    });
    return () => unsub();
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
      <AuthorInfo post={post} navigateToProfile={navigateToProfile}>
        {!shareMode && (
          <>
            {!selectMode ? (
              <>
                <button
                  tabIndex={tabIndex}
                  className={s.dot}
                  aria-expanded={toggleMenu !== ""}
                  aria-label="open post option dropdown"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMenu
                      ? settoggleMenu?.("")
                      : settoggleMenu?.(String(id));
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
                      setSelectedId(
                        selectedId?.filter(
                          (selectedId) => selectedId.postId !== id
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
                      setSelectedId([
                        ...selectedId!,
                        {
                          postId: id?.toString()!,
                          authorId: post.authorId.toString(),
                          share: share?.id
                            ? { postId: share?.id, authorId: share?.author }
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
            <AdminMenu />
          ) : (
            <Menu
              authorId={authorId?.toString()!}
              id={id?.toString()!}
              isSaved={post.isSaved}
              uid={authUser?.uid!}
            />
          )}
        </>
      )}
      {post.deletedByAuthor && (
        <PostFallback
          post={post}
          deletePost={deletePost!}
          canRemove={{
            uid: String(authUser?.uid),
            deleteURL: `${getCollectionPath.recentPosts({
              uid: authUser?.uid,
            })}/${post.recentId}`,
            id: String(id),
          }}
        />
      )}
      {text !== "" && text && (
        <TextInput
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
      )}
      <PhotoLayout post={post} preview />
      <SharePreview selectMode={selectMode} post={post} />
      <SocialCount
        Likes={Likes}
        setLikes={setLikes}
        likeCount={likeCount}
        post={post}
      />
    </span>
  );
}
export default memo(Content);
