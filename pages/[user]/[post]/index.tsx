import { getAuth } from "firebase/auth";
import {
  DocumentData,
  DocumentSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useEffect, useRef, useState } from "react";
import BackHeader from "../../../components/Header/BackHeader";
import FooterInput from "../../../components/Input/FooterInput";
import Input from "../../../components/Input/Input";
import AuthorInfo from "../../../components/Post/AuthorInfo";
import { Footer } from "../../../components/Post/Footer";
import PhotoLayout from "../../../components/Post/PhotoLayout";
import { SharePreview } from "../../../components/Post/SharePreview";
import { SocialCount } from "../../../components/Post/SocialCount";
import { app, db, postInfo, postToJSON } from "../../../lib/firebase";
import { verifyIdToken } from "../../../lib/firebaseAdmin";
import { updatePost } from "../../../lib/firestore/post";
import { deleteStorage, uploadMedia } from "../../../lib/storage";
import s from "../../../styles/Home.module.scss";
import { Media, Post as PostType, Props } from "../../../types/interfaces";
import { Welcome } from "../../../components/Welcome";
import CommentInput from "../../../components/Comment/Input";
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
    const { uid } = token;
    const { user: authorId, post: postId } = context.query;
    let expired = false;
    // const postDoc = isAdmin
    //   ? query(
    //       collection(db, `users/${authorId}/posts`),
    //       where("id", "==", postId)
    //     )
    //   : query(
    //       collection(db, `users/${authorId}/posts`),
    //       where("id", "==", postId)
    //       // where("visibility", "not-in", ["Friend", "Public"])
    //     );
    const postDoc = doc(db, `users/${authorId}/posts/${postId}`);
    const postSnap = await getDoc(postDoc);
    const p = await postToJSON(postSnap as DocumentSnapshot<DocumentData>);
    const newPost = await postInfo(p, uid);
    // // const UserRecord = await getUserData(postJSON.authorId);
    // // const userJSON = userToJSON(UserRecord) as UserRecord;
    // const profileQuery = doc(db, `/users/${postJSON.authorId}`);
    // const profileSnap = await getDoc(profileQuery);
    // const profileData = profileSnap.data()!;
    // const authorProfile = profileData.profile as account["profile"];
    // const post = {
    //   ...postJSON,
    //   author: {
    //     ...authorProfile,
    //   },
    // };
    // let withLike;
    // const postRef = doc(db, `users/${post.authorId}/posts/${post.id}`);
    // const likeRef = collection(postRef, "likes");
    // const likeDoc = await getDocs(likeRef);
    // const likedByUser = doc(
    //   db,
    //   `users/${post.authorId}/posts/${post.id}/likes/${uid}`
    // );
    // const isLiked = await getDoc(likedByUser);
    // const like = likeDoc.docs.map((doc) => doc.data());

    // if (!likeDoc.empty) {
    //   withLike = {
    //     ...post,
    //     like: [...like],
    //     isLiked: isLiked.exists() ? true : false,
    //   };
    // } else {
    //   withLike = {
    //     ...post,
    //     isLiked: false,
    //   };
    // }

    // let newPost;
    // if (withLike.sharePost) {
    //   const postDoc = doc(
    //     db,
    //     `users/${withLike.sharePost?.author}/posts/${withLike.sharePost?.id}`
    //   );
    //   const posts = await getDoc(postDoc);

    //   if (posts.exists()) {
    //     const postJSON = await postToJSON(
    //       posts as DocumentSnapshot<DocumentData>
    //     );
    //     // const UserRecord = await getUserData(postJSON.authorId);
    //     // const userJSON = userToJSON(UserRecord);
    //     const profileQuery = doc(db, `/users/${postJSON.authorId}`);
    //     const profileSnap = await getDoc(profileQuery);
    //     const profileData = profileSnap.data()!;
    //     const authorProfile = profileData.profile as account["profile"];

    //     const sharePost = {
    //       ...postJSON,
    //       author: {
    //         ...authorProfile,
    //       },
    //     };
    //     newPost = {
    //       ...withLike,
    //       sharePost: {
    //         id: withLike.sharePost.id,
    //         author: withLike.sharePost.author,
    //         post: { ...sharePost },
    //       },
    //     };
    //   } else {
    //     newPost = {
    //       ...withLike,
    //       sharePost: {
    //         id: withLike.sharePost.id,
    //         author: withLike.sharePost.author,
    //         post: null,
    //       },
    //     };
    //   }
    // } else {
    //   newPost = {
    //     ...withLike,
    //   };
    // }

    if (
      !postSnap.exists() ||
      (uid !== p.authorId && p.visibility === "Onlyme")
    ) {
      return {
        notFound: true,
      };
    } else {
      return {
        props: {
          expired,
          uid,
          post: newPost,
        },
      };
    }
  } catch (error) {
    console.log("SSR Error " + error);
    return {
      props: {
        expired: true,
        uid: "",
        post: {},
      },
    };
  }
};
export default function Page(props: {
  expired: boolean;
  uid: string;
  post: PostType;
}) {
  const { expired, uid, post } = props;
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
  }, []);
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

  const [likeCount, setlikeCount] = useState(post.like?.length);
  if (expired) return <Welcome expired={expired} />;
  return (
    <div className="user">
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
        style={{ marginBottom: canEdit ? "65px" : "0" }}
        className={s.container}
      >
        <AuthorInfo navigateToProfile={navigateToProfile} post={post} />
        <Input
          style={{
            paddingTop: text === "" ? "0" : ".5rem",
            marginBlock: ".5rem",
            marginBottom: text === "" ? "1rem" : "1rem",
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
        <SocialCount likeCount={likeCount!} post={post} />
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
            likeCount={likeCount!}
            setlikeCount={setlikeCount}
            post={post}
            style={{ borderBottom: "1px solid rgb(235, 235, 235)" }}
          />
        )}
        <CommentInput />
      </div>
    </div>
  );
}
