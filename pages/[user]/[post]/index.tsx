import Comment from "@/components/Comment";
import CommentInput from "@/components/Comment/Input";
import TextInput from "@/components/Form/Input/TextInput";
import PostSettingFooterForm from "@/components/Form/PostSettingFooter";
import BackHeader from "@/components/Header/BackHeader";
import AuthorInfo from "@/components/Post/AuthorInfo";
import { Footer } from "@/components/Post/Footer";
import PhotoLayout from "@/components/Post/PhotoLayout";
import { SharePreview } from "@/components/Post/SharePost/Preview";
import { SocialCount } from "@/components/Post/SocialCount";
import { Welcome } from "@/components/Welcome";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { Comment_LIMIT } from "@/lib/QUERY_LIMIT";
import {
  DescQuery,
  app,
  db,
  getCollectionPath,
  getPath,
  getProfileByUID,
  postInfo,
  postToJSON,
} from "@/lib/firebase";
import { verifyIdToken } from "@/lib/firebaseAdmin";
import { fetchComments } from "@/lib/firestore/comment";
import { updatePost } from "@/lib/firestore/post";
import { checkPhotoURL } from "@/lib/firestore/profile";
import { deleteMedia, uploadMedia } from "@/lib/storage";
import s from "@/styles/Home.module.scss";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { getAuth } from "firebase/auth";
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
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { PageContext, PageProps } from "../../../context/PageContext";
import {
  Media,
  Post,
  Post as PostType,
  account,
  likes,
} from "../../../types/interfaces";
import { LoadingButton } from "@/components/Button/LoadingButton";
import useQueryFn from "@/hooks/useQueryFn";
import useEnterSave from "@/hooks/useEnterSave";

export const getServerSideProps: GetServerSideProps = async (context) => {
  // context.res.setHeader(
  //   "Cache-Control",
  //   "public, s-maxage=10, stale-while-revalidate=59"
  // );
  try {
    const cookies = nookies.get(context);
    const token = await verifyIdToken(cookies.token);
    const { uid } = token as DecodedIdToken;
    const { user: authorId, post: postId } = context.query;
    let expired = false;
    const postRef = doc(
      db,
      `${getCollectionPath.posts({ uid: String(authorId) })}/${postId}`
    );
    const postDoc = await getDoc(postRef);
    const p = await postToJSON(postDoc as DocumentSnapshot<DocumentData>);
    const newPost = (await postInfo(p, uid)) as Post;
    const profileData = (await getProfileByUID(uid)) as account["profile"];
    const profile = {
      ...profileData,
      photoURL: checkPhotoURL(profileData.photoURL),
    };
    const commentQuery = DescQuery(
      getPath("comments", {
        authorId: String(newPost?.authorId),
        postId: String(newPost?.id),
      }),
      Comment_LIMIT + 1
    );
    let hasMore = false;
    let comments = await fetchComments(commentQuery);
    hasMore = (comments?.length ?? 0) > Comment_LIMIT;
    if (hasMore) {
      comments?.pop();
    }
    const withComment = { ...newPost, comments };
    if (
      !postDoc.exists() ||
      (uid !== p.authorId && p.visibility === "Onlyme")
    ) {
      return {
        notFound: true,
      };
    } else {
      return {
        props: {
          hasMore,
          profile,
          expired,
          uid,
          post: withComment,
        },
      };
    }
  } catch (error) {
    console.log("SSR Error in user/post " + error);
    return {
      props: {
        hasMore: false,
        profile: null,
        expired: true,
        uid: "",
        post: {},
      },
    };
  }
};
export default function Page(props: {
  hasMore: boolean;
  expired: boolean;
  uid: string;
  post: PostType;
  profile: account["profile"];
}) {
  const { hasMore, expired, uid, post, profile } = props;
  const { currentUser } = useContext(PageContext) as PageProps;
  const router = useRouter();
  const [visibility, setVisibility] = useState(post?.visibility!);
  const InputRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<PostType["media"] | File[]>([
    ...(post?.media ?? []),
  ]);
  const [deleteFile, setdeleteFile] = useState<PostType["media"]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const text = post.text
    ? post.text
        .replaceAll("</div>", "")
        .replace("<div>", "<br>")
        .replaceAll("<div><br><div>", "<br>")
        .replaceAll("<br><div>", "<br>")
    : "";
  useEffect(() => {
    InputRef.current?.focus();
    setFiles(post.media);
  }, [post.media]);
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        InputRef.current?.innerHTML !== post.text ||
        visibility?.toLowerCase() !== post.visibility?.toLowerCase() ||
        files?.length !== post.media?.length ||
        deleteFile?.length !== 0
      ) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [
    deleteFile?.length,
    files?.length,
    post.media?.length,
    post.text,
    post.visibility,
    visibility,
  ]);
  useEffect(() => {
    router.beforePopState(({ as }) => {
      const currentPath = router.asPath;
      if (
        (as !== currentPath && InputRef.current?.innerHTML !== post.text) ||
        visibility?.toLowerCase() !== post.visibility?.toLowerCase() ||
        files?.length !== post.media?.length ||
        deleteFile?.length !== 0
      ) {
        if (confirm("Changes you made may not be saved.")) {
          return true;
        } else {
          window.history.pushState(null, document.title, currentPath);
          return false;
        }
      }
      return true;
    });

    return () => {
      router.beforePopState(() => true);
    };
  }, [
    deleteFile?.length,
    files?.length,
    post.media?.length,
    post.text,
    post.visibility,
    router,
    visibility,
  ]);

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
  const auth = getAuth(app);
  const navigateToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/${post?.authorId?.toString()}`);
  };
  const { queryFn } = useQueryFn();
  const updateHandler = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !post || !InputRef.current) return;
    if (uid !== post.authorId) {
      throw new Error("Unauthorized !");
    }
    if (
      visibility.toLowerCase() === post.visibility?.toLowerCase() &&
      InputRef.current?.innerHTML
        .replace(/\n/g, "<br>")
        .replaceAll("&nbsp;", " ") === post.text &&
      files?.length === post.media?.length &&
      // value === "" &&
      deleteFile?.length === 0
    )
      return;
    // setUpdateLoading(true);
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
        return null;
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
    } catch (error: any) {
      alert(error.message);
    }
  };
  const [likeCount, setlikeCount] = useState(
    parseInt(post.likeCount?.toString()!)
  );
  const [limitedComments, setlimitedComments] = useState(post.comments);
  const [commentEnd, setcommentEnd] = useState(false);
  const [commentLoading, setcommentLoading] = useState(false);
  const fetchMoreComment = useCallback(
    async function () {
      setcommentLoading(true);
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
        Comment_LIMIT + 1,
        startAfter(date)
      );
      const comments = await fetchComments(commentQuery);
      setlimitedComments(limitedComments.concat(comments ?? []));
      // console.log(comments?.length);
      // console.log({ limitedComments });
      setcommentLoading(false);
      setcommentEnd(comments?.length! < Comment_LIMIT);
    },
    [limitedComments, post?.authorId, post?.id]
  );
  const [Likes, setLikes] = useState<likes | []>([]);
  const { scrollRef } = useInfiniteScroll({
    hasMore,
    scrollParent: true,
    fetchMoreData: fetchMoreComment,
    postEnd: commentEnd,
  });
  const updateBtnRef = useRef<HTMLButtonElement>(null)
useEnterSave(InputRef,updateBtnRef)
  if (expired) return <Welcome expired={expired} />;
  return (
    <div className="user" ref={scrollRef}>
      <BackHeader
        onClick={() => {
          InputRef.current?.focus();
          router.back();
        }}
      >
        <h2 className={s.title}>{canEdit ? "Edit" : "Post"}</h2>
        {canEdit && (
          <LoadingButton
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
          marginBottom: canEdit
            ? "65px"
            : limitedComments?.length <= Comment_LIMIT || commentEnd
            ? "80px"
            : "130px",
        }}
        className={s.container}
      >
        <AuthorInfo navigateToProfile={navigateToProfile} post={post} />
        <TextInput
          style={{
            cursor: canEdit ? "initial" : "default",
          }}
          role="textbox"
          element={InputRef}
          contentEditable={canEdit ? true : false}
          dangerouslySetInnerHTML={{ __html: client ? text : "" }}
        />
        <PhotoLayout
          margin={canEdit ? true : false}
          deleteFile={deleteFile}
          setdeleteFile={setdeleteFile}
          post={post}
          edit={canEdit ? true : false}
          files={files}
          setFiles={setFiles}
        />
        <SharePreview post={post} />
        {canEdit ? (
          <PostSettingFooterForm
            fileRef={fileRef}
            files={files}
            setFiles={setFiles}
            visibility={post.visibility}
            setVisibility={setVisibility}
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
              currentUser={currentUser}
              likeCount={likeCount}
              setlikeCount={setlikeCount}
              style={{ borderBottom: "1px solid rgb(235, 235, 235)" }}
              post={post}
            />
            <Comment
              hasMore={hasMore}
              commentLoading={commentLoading}
              commentEnd={commentEnd}
              post={post}
              uid={uid}
              comments={limitedComments}
              setComments={setlimitedComments}
            />
            <CommentInput
              comments={limitedComments}
              profile={profile}
              setlimitedComments={setlimitedComments}
              post={post}
              uid={uid!}
              authorId={post.authorId?.toString() ?? null}
              postId={post.id?.toString()!}
            />
          </>
        )}
      </div>
    </div>
  );
}
