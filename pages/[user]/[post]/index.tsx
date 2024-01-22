import { LoadingButton } from "@/components/Button/LoadingButton";
import Comment from "@/components/Comment";
import CommentInput from "@/components/Comment/Input";
import TextInput from "@/components/Form/Input/TextInput";
import PostSettingFooterForm from "@/components/Form/PostSettingFooter";
import BackHeader from "@/components/Header/BackHeader";
import AuthorInfo, { User, UserName } from "@/components/Post/AuthorInfo";
import Footer from "@/components/Post/Footer";
import PhotoLayout from "@/components/Post/PhotoLayout";
import { SocialCount } from "@/components/Post/SocialCount";
import { Welcome } from "@/components/Welcome";
import useEnterSave from "@/hooks/useEnterSave";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import useQueryFn from "@/hooks/useQueryFn";
import { Comment_LIMIT } from "@/lib/QUERY_LIMIT";
import {
  DescQuery,
  JSONTimestampToDate,
  db,
  getCollectionPath,
  getPath,
  getProfileByUID,
  postInfo,
  postToJSON,
} from "@/lib/firebase";
import poststyles from '@/components/Post/index.module.scss'
import { verifyIdToken } from "@/lib/firebaseAdmin";
import { fetchComments, fetchSingleComment } from "@/lib/firestore/comment";
import { updatePost } from "@/lib/firestore/post";
import { checkPhotoURL } from "@/lib/firestore/profile";
import { deleteMedia, uploadMedia } from "@/lib/storage";
import s from "@/styles/Home.module.scss";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
// import {PageContext : Page} from '@/context/PageContext'
import CommentItem from "@/components/Comment/CommentItem";
import { SharePreview } from "@/components/Post/SharePreview";
import { usePageContext } from "@/context/PageContext";
import ErrorPage from "@/pages/404";
import {
  faEarth,
  faLock,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  DocumentData,
  DocumentSnapshot,
  Timestamp,
  doc,
  getDoc,
  startAfter,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import {
  Comment as CommentType,
  Media,
  Post,
  Post as PostType,
  account,
  likes,
} from "../../../types/interfaces";
export interface CommentProps {
  replyInput?: {
    comment: CommentType | null;
    authorFirstReplyId: string;
    text: string;
    id: string;
    authorId: string;
    authorName: string;
    parentId: string;
    nested: boolean;
    ViewmoreToggle: boolean;
  };
  setreplyInput?: Function;
  setComments?: Function;
  parentId?: string;
  nested?: boolean;
  hasMoreComment?: boolean;
  commentEnd?: boolean;
  uid: DecodedIdToken["uid"];
  comments?: Post["comments"];
  post: Post | null;
  profile?: account["profile"];
  replyInputRef?: RefObject<HTMLInputElement>;
}
type TinitialProps = {
  hasMoreComment: boolean;
  expired: boolean;
  uid: string;
  post: PostType | null;
  profile: account["profile"] | null;
  notFoundType: string | null;
};
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookies = nookies.get(context);
    if (context.query.user === "api") {
      return {
        notFound: true,
      };
    }
    const token = await verifyIdToken(cookies.token);
    const { uid } = token as DecodedIdToken;
    const { user: authorId, post: postId } = context.query;
    console.log({ postQuery: context.query });
    let expired = false;
    const postRef = doc(
      db,
      `${getCollectionPath.posts({ uid: String(authorId) })}/${postId}`
    );
    const postDoc = await getDoc(postRef);
    const isPostExists = postDoc.exists();
    if (!isPostExists) {
      return {
        props: {
          notFoundType: "post",
          hasMoreComment: false,
          profile: null,
          expired: true,
          uid: "",
          post: {},
        },
        // notFound: true,
      };
      // return {
      //   //  notFound: true,
      //   props: {
      //     // notFoundType: "post",
      //     hasMoreComment,
      //     profile,
      //     expired,
      //     uid,
      //     post: withComment,
      //   },
      // };
    }
    const post = await postToJSON(postDoc as DocumentSnapshot<DocumentData>);

    const notAdminAndPostOnlyMe =
      uid !== post.authorId && post.visibility === "Onlyme";
    if (notAdminAndPostOnlyMe) {
      return {
        props: {
          notFoundType: "post",
          hasMoreComment: false,
          profile: null,
          expired: true,
          uid: "",
          post: null,
        },
      };
    }
    const [newPost, profileData] = await Promise.all([
      postInfo(post, uid),
      getProfileByUID(uid),
    ]);
    const profile = profileData
      ? {
          ...profileData,
          photoURL: checkPhotoURL(profileData.photoURL),
        }
      : null;
    let hasMoreComment = false;
    const commentQuery = DescQuery(
      getPath("comments", {
        authorId: String(newPost?.authorId),
        postId: String(newPost?.id),
      }),
      Comment_LIMIT
    );
    const comments = await fetchComments(newPost, uid, commentQuery);

    const currentLength = comments.length;
    const totalCount = newPost.commentCount ?? 0;
    hasMoreComment = currentLength < Number(totalCount);
    const withComment = { ...newPost, comments };

    return {
      props: {
        hasMoreComment,
        profile,
        expired,
        uid,
        post: withComment,
      },
    };
  } catch (error) {
    console.log("SSR Error in authorId/post " + error);
    return {
      props: {
        hasMoreComment: false,
        profile: null,
        expired: true,
        uid: "",
        post: null,
      },
    };
  }
};
export default function Page({
  hasMoreComment,
  expired,
  uid,
  post,
  profile,
  notFoundType,
}: TinitialProps) {
  // const { hasMoreComment, expired, uid, post, profile } = props;
  const [replyInput, setreplyInput] = useState<CommentProps["replyInput"]>({
    comment: null,
    authorFirstReplyId: "",
    text: "",
    id: "",
    authorId: "",
    authorName: "",
    ViewmoreToggle: false,
    nested: false,
    parentId: "",
  });
  const { currentUser, auth } = usePageContext();
  const router = useRouter();
  const InputRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);
  const [isDropDownOpenInNestedComment, setisDropDownOpenInNestedComment] =
    useState(false);
  // const post2 = post;
  // if(!post)return;
  const [form, setForm] = useState<{
    files: File[] | PostType["media"];
    visibility: PostType["visibility"];
  }>({
    files: [...(post?.media ?? [])],
    visibility: post?.visibility ?? "Public",
  });
  const { files, visibility } = form;
  const updateForm = useCallback((newForm: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...newForm }));
  }, []);
  const [deleteFile, setdeleteFile] = useState<PostType["media"]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const media = post && post.media;
  useEffect(() => {
    InputRef.current?.focus();
    updateForm({ files: media });
  }, [media, updateForm]);

  const [input, setInput] = useState((post && post.text) ?? "");
  const dirtyForm =
    post && !notFoundType
      ? input !== post.text ||
        visibility?.toLowerCase() !== post.visibility?.toLowerCase() ||
        files?.length !== post.media?.length ||
        deleteFile?.length !== 0
      : false;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyForm) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dirtyForm]);
  useEffect(() => {
    router.beforePopState(({ as }) => {
      const currentAsPath = router.asPath;
      if (as !== currentAsPath && dirtyForm) {
        if (!confirm("Changes you made may not be saved.")) {
          window.history.pushState(null, document.title, currentAsPath);
        }
      }
      return true;
    });

    return () => {
      router.beforePopState(() => true);
    };
  }, [dirtyForm, router]);

  const [client, setClient] = useState(false);
  useEffect(() => {
    setClient(true);
  }, []);
  let newMedia: PostType["media"] = [];
  const isPostOwner = post?.authorId === uid;
  const canEdit = router.query.edit && isPostOwner;

  useEffect(() => {
    if (canEdit === false && router.query.edit) {
      delete router.query.edit;
      router.replace({
        pathname: router.pathname,
        query: router.query,
      });
    }
  }, [canEdit, router]);

  const navigateToProfile = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      router.push(`/${post?.authorId?.toString()}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [post?.authorId]
  );
  const { queryFn } = useQueryFn();
  const updateHandler = async () => {
    const uid = auth.currentUser?.uid;
    if (!post || !InputRef.current) return;
    if (!uid) {
      throw new Error("You need to login!");
    }
    if (uid !== post.authorId) {
      throw new Error("Unauthorized !");
    }
    if (
      visibility.toLowerCase() === post.visibility?.toLowerCase() &&
      InputRef.current?.innerHTML
        .replace(/\n/g, "<br>")
        .replaceAll("&nbsp;", " ") === post.text &&
      files?.length === post.media?.length &&
      deleteFile?.length === 0
    ) {
      console.log("Dirty form");
      throw new Error("Dirty form");
    }
    try {
      try {
        const uploadedFiles = await uploadMedia(files as File[]);
        newMedia = [
          ...(files as Media[]),
          ...(uploadedFiles.filter((file) => file !== null) as Media[]),
        ].filter((file) => file?.url);
        await deleteMedia(deleteFile!);
      } catch (error) {
        console.log("Error uploading and Deleting files:", error);
        return;
      }
      await updatePost(
        uid,
        InputRef.current.innerHTML
          .replaceAll("<div>", "")
          .replaceAll("</div>", "")
          .replace("<div>", "<br>")
          .replaceAll("<div><br><div>", "<br>")
          .replaceAll("<br><div>", "<br>")
          .replace("</div>", "")
          .replaceAll(
            /(?:https?|ftp):\/\/[\n\S]+/g,
            (url) => `<a href="${url}">${url}</a>`
          ),
        newMedia,
        post.id?.toString()!,
        post,
        visibility
      );
      queryFn.invalidate("myPost");
      router.replace("/", undefined, { scroll: false });
    } catch (error: unknown) {
      alert(error);
    }
  };
  const text =
    post && post.text
      ? post.text
          .replaceAll("</div>", "")
          .replace("<div>", "<br>")
          .replaceAll("<div><br><div>", "<br>")
          .replaceAll("<br><div>", "<br>")
      : "";
  const [likeCount, setlikeCount] = useState(
    parseInt(post && post.likeCount ? post.likeCount.toString() : "0") ?? 0
  );
  const [limitedComments, setlimitedComments] = useState(
    (post && post.comments) ?? []
  );

  const [commentEnd, setcommentEnd] = useState(false);
  const fetchMoreComment = useCallback(
    async function () {
      if (!post) return;
      if (!limitedComments) return;
      const comment = limitedComments?.[limitedComments?.length - 1];

      const date = new Timestamp(
        comment.createdAt.seconds,
        comment.createdAt.nanoseconds
      );
      const commentQuery = DescQuery(
        getPath("comments", {
          authorId: String(post?.authorId),
          postId: String(post?.id),
        }),
        Comment_LIMIT,
        startAfter(date)
      );
      const comments = await fetchComments(post, uid, commentQuery);
      // setlimitedComments(limitedComments.concat(comments ?? []));
      setlimitedComments((prev: CommentType[]) => [...prev, ...comments]);
      // console.log({
      //   jjj2222: {
      //     l: comments.length,
      //     totoal: limitedComments.length,
      //     count: post.commentCount,
      //   },
      // });
      if (limitedComments.length >= Number(post.commentCount)) {
        setcommentEnd(true);
      }
    },
    [limitedComments, post, uid]
  );
  const [Likes, setLikes] = useState<likes[]>([]);
  const { user: authorId, post: postId } = router.query;
  const { scrollRef } = useInfiniteScroll({
    hasMore: hasMoreComment,
    scrollParent: true,
    fetchMoreData: fetchMoreComment,
    postEnd: commentEnd,
  });
  const updateBtnRef = useRef<HTMLButtonElement>(null);
  useEnterSave(InputRef, updateBtnRef);
  const [commentNotFoundLoading, setCommentNotFoundLoading] = useState(false);
  useEffect(
    () => {
      // handleNotFoundReply
      const commentId = router.query.comment;
      const replyCommentPath = router.asPath.split("#")[1]?.split("-")[0];
      const replyId = router.asPath.split("#")[1]?.split("-")[1];

      if (post && replyCommentPath === "reply" && commentId && replyId) {
        const isCommentFound = limitedComments?.find((l) => l.id === commentId);
        if ((Number(post.commentCount) ?? 0) <= 0) return;
        if (!isCommentFound) {
          console.log("we can't find comment for reply " + commentId);
          const notFoundedCommentDocRef = doc(
            db,
            `${getCollectionPath.comments({
              authorId: String(post.authorId),
              postId: String(post.id),
            })}/${commentId}`
          );
          (async function fetchNotFoundComment() {
            const getNotFoundCommentDoc = await getDoc(notFoundedCommentDocRef);
            if (!getNotFoundCommentDoc.exists()) return;
            setCommentNotFoundLoading(true);
            const data = await fetchSingleComment(
              getNotFoundCommentDoc,
              post,
              uid
            );
            if (!data) return;
            data.recentRepliesLoading = true;
            let replyData: CommentType[] = data.recentReplies ?? [];

            const replyDoc = await getDoc(
              doc(
                db,
                `${getCollectionPath.commentReplies({
                  authorId: String(authorId),
                  postId: String(postId),
                  commentId: String(commentId),
                })}/${replyId}`
              )
            );
            replyData.some((recent) => {
              console.log(recent.id + " contains in " + replyId);
            });
            const reply = await fetchSingleComment(
              replyDoc,
              { id: String(postId), authorId: String(authorId) },
              String(uid)
            );
            if (replyData.some((recent) => recent.id == replyId)) {
              console.log("author first reply === url reply id");
            } else if (reply) {
              console.log("we don't have reply so , we update with reply data");
              replyData = [...replyData, { ...reply }];
              data.recentReplies = [...replyData];
              data.replyCount = (data.replyCount ?? 0) - 1;
            }
            data.recentRepliesLoading = false;
            setlimitedComments((prev: CommentType[]) => [{ ...data }, ...prev]);
            setCommentNotFoundLoading(false);
          })();
        } else {
          const comment = limitedComments.find((c) => c.id === commentId);
          if (
            comment?.recentReplies &&
            comment?.recentReplies.some((recent) => recent.id === replyId)
          )
            return;
          console.log("we fetch reply by id now");
          setlimitedComments((prev: CommentType[]) =>
            prev.map((c) => {
              console.log({ cid: c.id, commentId });
              if (c.id === commentId) {
                // if (c.recentReplies.some((r) => r.id === recentReply.id)) return;
                return {
                  ...c,
                  recentRepliesLoading: true,
                };
              }
              return { ...c };
            })
          );

          (async function fetchNotFoundReply() {
            try {
              const replyDoc = await getDoc(
                doc(
                  db,
                  `${getCollectionPath.commentReplies({
                    authorId: String(authorId),
                    postId: String(postId),
                    commentId: String(commentId),
                  })}/${replyId}`
                )
              );
              if (!replyDoc.exists()) {
                setlimitedComments((prev: CommentType[]) =>
                  prev.map((c) => {
                    if (c.id === commentId) {
                      return {
                        ...c,
                        recentRepliesLoading: false,
                      };
                    }
                    return { ...c };
                  })
                );
                throw Error("Reply Not Found!");
              }
              const data = await fetchSingleComment(
                replyDoc,
                { id: String(postId), authorId: String(authorId) },
                String(uid)
              );
              setlimitedComments(
                (prev: CommentType[]) =>
                  prev?.map((c) => {
                    if (c.id === commentId) {
                      let recentReply = data!;
                      if (
                        recentReply &&
                        !c.recentReplies.some((r) => r.id === recentReply.id)
                      ) {
                        console.info("set reply (found comment by url)");
                        return {
                          ...c,
                          recentReplies: [
                            recentReply!,
                            ...(c.recentReplies ?? []),
                          ],
                          replyCount: (c.replyCount ?? 0) - 1,
                          recentRepliesLoading: false,
                        };
                      }
                    }
                    return c;
                  })
              );
            } catch (error) {
              alert(error);
            }
          })();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.asPath, router.query, uid]
  );
  useEffect(
    () => {
      // handleNotFoundComment
      if (router.query.comment) return;
      if ((Number(post && post.commentCount) ?? 0) <= 0) return;
      // console.log(router.asPath.split("#")[1]?.split("-")[0]);
      const commentId =
        router.asPath.split("#")[1]?.split("-")[0] === "comment" &&
        router.asPath.split("#")[1]?.split("-")[1];
      const isCommentFound = limitedComments?.find((l) => l.id === commentId);
      if (post && commentId && !isCommentFound) {
        console.log("we can't find comment - Fetching ..." + commentId);
        const commentRef = doc(
          db,
          `${getCollectionPath.comments({
            authorId: String(post.authorId),
            postId: String(post.id),
          })}/${commentId}`
        );
        (async function fetchNotFoundComment() {
          setCommentNotFoundLoading(true);
          const commentDoc = await getDoc(commentRef);
          if (commentDoc.exists()) {
            const data = await fetchSingleComment(commentDoc, post, uid);
            if (!data) return;
            setCommentNotFoundLoading(false);
            setlimitedComments((prev: CommentType[]) => [{ ...data }, ...prev]);
            return data;
          }
        })();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.asPath, router.query, uid]
  );
  if (notFoundType) return <ErrorPage title="Couldn't find this Post" />;
  if (expired) return <Welcome expired={expired} />;
  if (!post) return;
  return (
    <div className="authorId" ref={scrollRef}>
      <BackHeader
        onClick={() => {
          InputRef.current?.focus();
          router.back();
        }}
      >
        <h2 className={s.title}>{canEdit ? "Edit" : "Post"}</h2>
        {canEdit && (
          <LoadingButton
            initialTitle="Update post"
            loadingTitle="Updating post"
            dirty={!dirtyForm}
            ref={updateBtnRef}
            className={s.submit}
            tabIndex={1}
            aria-label="update post"
            type="submit"
            onClick={updateHandler}
          >
            Submit
          </LoadingButton>
        )}
      </BackHeader>
      <div
        style={{
          marginBottom: canEdit ? "65px" : commentEnd ? "80px" : "130px",
        }}
        className={s.container}
      >
        <AuthorInfo>
          <User
            profile={post.author as account["profile"]}
            navigateToProfile={navigateToProfile}
          >
            <UserName
              hasChildren={true}
              navigateToProfile={navigateToProfile}
              profile={post.author as account["profile"]}
            />
            <div className={poststyles.moreInfo}>
              {typeof post.createdAt !== "number" && (
                <p className={s.date} suppressHydrationWarning>
                  {JSONTimestampToDate(post.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </p>
              )}
              {post.visibility?.toLowerCase() === "public" && (
                <span title="Everyone can see this Post">
                  <FontAwesomeIcon icon={faEarth} />
                </span>
              )}
              {post.visibility?.toLowerCase() === "friend" && (
                <span title="Friends can see this Post">
                  <FontAwesomeIcon icon={faUserGroup} />
                </span>
              )}
              {post.visibility?.toLowerCase() === "onlyme" && (
                <span title="Only you can see this Post">
                  <FontAwesomeIcon icon={faLock} />
                </span>
              )}
            </div>
          </User>
        </AuthorInfo>
        <TextInput
          onInput={(e) => {
            setInput(
              e.currentTarget.innerHTML
                .replace(/\n/g, "<br>")
                .replaceAll("&nbsp;", " ")
            );
          }}
          style={{
            cursor: canEdit ? "initial" : "default",
          }}
          role="textbox"
          element={InputRef}
          contentEditable={canEdit ? true : false}
          dangerouslySetInnerHTML={{ __html: client ? text : "" }}
        />
        <PhotoLayout
          fileRef={fileRef}
          margin={canEdit ? true : false}
          deleteFile={deleteFile}
          setdeleteFile={setdeleteFile}
          post={post}
          edit={canEdit ? true : false}
          form={form}
          updateForm={updateForm}
        />
        <SharePreview post={post} />
        {canEdit ? (
          <PostSettingFooterForm
            updateForm={updateForm}
            fileRef={fileRef}
            form={form}
          />
        ) : (
          <>
            <SocialCount
              Likes={Likes}
              setLikes={setLikes}
              likeCount={likeCount}
              post={post}
            />
            <Footer
              setLikes={setLikes}
              likeCount={likeCount}
              setlikeCount={setlikeCount}
              style={{ borderBottom: "1px solid rgb(235, 235, 235)" }}
              post={post}
            />
            <Comment
              hasMoreComment={hasMoreComment}
              commentEnd={commentEnd}
              comments={limitedComments}
              commentNotFoundLoading={commentNotFoundLoading}
            >
              {limitedComments?.map((comment) => (
                <CommentItem
                  key={String(comment.id)}
                  replyInputRef={replyInputRef}
                  replyInput={replyInput}
                  setreplyInput={setreplyInput}
                  setisDropDownOpenInNestedComment={
                    setisDropDownOpenInNestedComment
                  }
                  isDropDownOpenInNestedComment={isDropDownOpenInNestedComment}
                  post={post}
                  client={client}
                  uid={uid}
                  comment={comment}
                  comments={limitedComments}
                  setComments={setlimitedComments}
                />
              ))}
            </Comment>
            <CommentInput
              setreplyInput={setreplyInput}
              replyInputRef={replyInputRef}
              replyInput={replyInput}
              comments={limitedComments}
              profile={profile!}
              setComments={setlimitedComments}
              post={post}
              uid={uid}
            />
          </>
        )}
      </div>
    </div>
  );
}
