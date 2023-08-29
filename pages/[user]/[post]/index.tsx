import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { getAuth } from "firebase/auth";
import {
  DocumentData,
  DocumentSnapshot,
  Timestamp,
  collection,
  doc,
  getDoc,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useCallback, useEffect, useRef, useState } from "react";
import Comment from "../../../components/Comment";
import CommentInput from "../../../components/Comment/Input";
import BackHeader from "../../../components/Header/BackHeader";
import FooterInput from "../../../components/Input/FooterInput";
import Input from "../../../components/Input/Input";
import AuthorInfo from "../../../components/Post/AuthorInfo";
import { Footer } from "../../../components/Post/Footer";
import PhotoLayout from "../../../components/Post/PhotoLayout";
import { SharePreview } from "../../../components/Post/SharePreview";
import { SocialCount } from "../../../components/Post/SocialCount";
import { Welcome } from "../../../components/Welcome";
import useInfiniteScroll from "../../../hooks/useInfiniteScroll";
import {
  app,
  db,
  getProfileByUID,
  postInfo,
  postToJSON,
} from "../../../lib/firebase";
import { verifyIdToken } from "../../../lib/firebaseAdmin";
import { fetchComments } from "../../../lib/firestore/comment";
import { updatePost } from "../../../lib/firestore/post";
import { deleteStorage, uploadMedia } from "../../../lib/storage";
import s from "../../../styles/Home.module.scss";
import {
  Media,
  Post,
  Post as PostType,
  Props,
  account,
  likes,
} from "../../../types/interfaces";
export const Comment_LIMIT = 10;
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  // context.res.setHeader(
  //   "Cache-Control",
  //   "public, s-maxage=10, stale-while-revalidate=59"
  // );
  try {
    const cookies = nookies.get(context);
    const token = await verifyIdToken(cookies.token);
    const { uid } = token as DecodedIdToken;
    console.log(uid);
    const { user: authorId, post: postId } = context.query;
    let expired = false;

    const postRef = doc(db, `users/${authorId}/posts/${postId}`);
    const postDoc = await getDoc(postRef);
    const p = await postToJSON(postDoc as DocumentSnapshot<DocumentData>);
    const newPost = (await postInfo(p, uid)) as Post;
    const profileData = (await getProfileByUID(uid)) as account["profile"];
    const profile = {
      ...profileData,
      photoURL: profileData.photoURL
        ? profileData.photoURL
        : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
    };
    const commentQuery = query(
      collection(
        db,
        `users/${newPost?.authorId}/posts/${newPost?.id}/comments`
      ),
      orderBy("createdAt", "desc"),
      limit(Comment_LIMIT)
    );
    const comments = await fetchComments(commentQuery);
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
          profile,
          expired,
          uid,
          post: withComment,
        },
      };
    }
  } catch (error) {
    console.log("SSR Error " + error);
    return {
      props: {
        profile: null,
        expired: true,
        uid: "",
        post: {},
      },
    };
  }
};
export default function Page(props: {
  expired: boolean;
  profile: account["profile"];
  uid: string;
  post: PostType;
}) {
  const { profile, expired, uid, post } = props;
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
        visibility.toLowerCase() !== post.visibility?.toLowerCase() ||
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
        visibility.toLowerCase() !== post.visibility?.toLowerCase() ||
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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      try {
        const uploadedFiles = await uploadMedia(files as File[]);
        newMedia = [
          ...(files as Media[]),
          ...(uploadedFiles.filter((file) => file !== null) as Media[]),
        ].filter((file) => file?.url);
        await deleteStorage(deleteFile!);
      } catch (error) {
        console.log("Error uploading and Deleting files:", error);
        return null;
      }
      console.log(post.sharePost?.author);
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
      console.log("fetching more comment");
      setcommentLoading(true);
      const comment = limitedComments?.[limitedComments?.length - 1]!;
      if (!comment) return;
      if (limitedComments.length > Comment_LIMIT) {
        setcommentLoading(true);
      }
      //  else {
      //   setcommentLoading(false);
      // }
      const date = new Timestamp(
        comment.createdAt.seconds,
        comment.createdAt.nanoseconds
      );
      const commentQuery = query(
        collection(db, `users/${post?.authorId}/posts/${post?.id}/comments`),
        orderBy("createdAt", "desc"),
        startAfter(date),
        limit(Comment_LIMIT)
      );
      const comments = await fetchComments(commentQuery);
      setlimitedComments(limitedComments.concat(comments));
      setcommentLoading(false);
      if (comments?.length! < Comment_LIMIT) {
        setcommentEnd(true);
      }
    },
    [limitedComments, post?.authorId, post?.id]
  );
  const [Likes, setLikes] = useState<likes | []>([]);
  const { scrollRef } = useInfiniteScroll(fetchMoreComment, commentEnd, true);

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
          <button
            tabIndex={1}
            aria-label="update post"
            type="submit"
            disabled={loading}
            className={s.submit}
            onClick={updateHandler}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        )}
      </BackHeader>
      <div
        style={{
          marginBottom: canEdit
            ? "65px"
            : limitedComments.length <= Comment_LIMIT || commentEnd
            ? "80px"
            : "130px",
        }}
        className={s.container}
      >
        <AuthorInfo navigateToProfile={navigateToProfile} post={post} />
        <Input
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
        {!canEdit && (
          <SocialCount
            Likes={Likes}
            setLikes={setLikes}
            likeCount={likeCount}
            post={post}
          />
        )}
        {canEdit ? (
          <FooterInput
            fileRef={fileRef}
            files={files}
            setFiles={setFiles}
            visibility={post.visibility}
            setVisibility={setVisibility}
          />
        ) : (
          <Footer
            profile={profile}
            likeCount={likeCount}
            setlikeCount={setlikeCount}
            post={post}
            style={{ borderBottom: "1px solid rgb(235, 235, 235)" }}
          />
        )}
        {!canEdit && (
          <>
            <Comment
              commentLoading={commentLoading}
              commentEnd={commentEnd}
              post={post}
              uid={uid}
              comments={limitedComments}
            />
            <CommentInput
              setlimitedComments={setlimitedComments}
              profile={profile}
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
