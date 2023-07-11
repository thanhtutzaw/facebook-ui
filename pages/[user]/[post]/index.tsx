import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { UserRecord } from "firebase-admin/lib/auth/user-record";
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
import Input from "../../../components/Input/Input";
import MediaInput from "../../../components/Input/MediaInput";
import { Footer } from "../../../components/Post/Footer";
import PhotoLayout from "../../../components/Post/PhotoLayout";
import { SelectVisiblity } from "../../../components/Post/SelectVisiblity";
import { app, db, postToJSON, userToJSON } from "../../../lib/firebase";
import { getUserData, verifyIdToken } from "../../../lib/firebaseAdmin";
import { updatePost } from "../../../lib/firestore/post";
import { deleteStorage, uploadMedia } from "../../../lib/storage";
import s from "../../../styles/Home.module.scss";
import { Media, Post, Props } from "../../../types/interfaces";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import AuthorInfo from "../../../components/Post/AuthorInfo";
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    const token = await verifyIdToken(cookies.token);
    const { uid } = token;
    console.log(uid);
    let expired = false;
    const { user: authorId, post: postId } = context.query;
    const postDoc = doc(db, `users/${authorId}/posts/${postId}`);
    const postSnap = await getDoc(postDoc);
    // const newPost = await Promise.all(
    //   postSnap
    // )

    //     displayName: UserRecord?.displayName ?? "Unknown User",
    //     photoURL: UserRecord?.photoURL ?? "",
    if (postSnap.exists()) {
      const post = await postToJSON(postSnap as DocumentSnapshot<DocumentData>);
      const UserRecord = await getUserData(post.authorId);
      const userJSON = userToJSON(UserRecord) as UserRecord;
      const newPost = {
        ...post,
        author: {
          ...userJSON,
        },
      };
      console.log(newPost);
      return {
        props: {
          uid,
          expired,
          post: newPost,
        },
      };
    } else {
      return {
        notFound: true,
      };
    }
  } catch (error) {
    console.log("SSR Error " + error);
    return {
      props: {
        uid: "",
        expired: true,
        post: {},
      },
    };
  }
};
export default function Post(props: {
  uid: string;
  expired: boolean;
  post: Post;
}) {
  const { uid, post, expired } = props;
  const router = useRouter();
  const [visibility, setVisibility] = useState(post?.visibility!);
  const InputRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<Post["media"] | File[]>([
    ...(post?.media ?? []),
  ]);
  const [deleteFile, setdeleteFile] = useState<Post["media"]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expired) {
      router.push("/");
      console.log("expired and pushed(in user/post.tsx)");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);
  // const text = post.text
  //   .replace(/<br\s*\/?>/g, "\n")
  //   .replaceAll("<div>", "")
  //   .replaceAll("</div>", "")
  //   .replaceAll("&nbsp;", " ");
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
    // setvalue(
    //   InputRef.current?.innerHTML
    //     .replaceAll("<div>", "")
    //     .replaceAll("</div>", "")
    //     .replace("<div>", "<br>")
    //     .replaceAll("<div><br><div>", "<br>")
    //     .replaceAll("<br><div>", "<br>")
    //     .replace("</div>", "")!
    //   // .replaceAll("</div>", "")
    //   // .replace("<div>", "<br>")
    //   // .replaceAll("<div><br><div>", "<br>")
    //   // .replaceAll("<br><div>", "<br>")!
    // );
    // if (viewRef && viewRef.current?.open) {
    //   window.history.pushState(null, document.title, router.asPath);
    //   return;
    // }
    router.beforePopState(({ as }) => {
      const currentPath = router.asPath;
      // if (viewRef && viewRef.current?.open) {
      //   viewRef.current.close();
      // }
      if (
        (as !== currentPath &&
          // value ===
          // InputRef.current?.innerHTML
          //   .replaceAll("<div>", "")
          //   .replaceAll("</div>", "")
          //   .replace("<div>", "<br>")
          //   .replaceAll("<div><br><div>", "<br>")
          //   .replaceAll("<br><div>", "<br>")
          //   .replace("</div>", "") ||

          // (visibility !== post.visibility ||
          //   files?.length !== post.media?.length ||
          //   deleteFile?.length !== 0)

          InputRef.current?.innerHTML !== post.text) ||
        visibility.toLowerCase() !== post.visibility?.toLowerCase() ||
        files?.length !== post.media?.length ||
        deleteFile?.length !== 0

        // value !== "" ||
        // deleteFile?.length !== 0
        // &&
        // value ===
        //   InputRef.current?.innerHTML
        //     .replaceAll("<div>", "")
        //     .replaceAll("</div>", "")
        //     .replace("<div>", "<br>")
        //     .replaceAll("<div><br><div>", "<br>")
        //     .replaceAll("<br><div>", "<br>")
        //     .replace("</div>", ""))
        // )
      ) {
        if (confirm("Changes you made may not be saved.")) {
          return true;
        } else {
          console.log(currentPath);
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

  let newMedia: Post["media"] = [];
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
    // alert(router.query.post);
    // const isViewingAuthorProfile = router.query.user && router.query.post;
    // if (isViewingAuthorProfile) return;
    router.push(`/${post?.authorId.toString()}`);
  };
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
            onClick={async () => {
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
                    ...(uploadedFiles.filter(
                      (file) => file !== null
                    ) as Media[]),
                  ].filter((file) => file?.url);
                  await deleteStorage(deleteFile!);
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
                router.replace("/", undefined, { scroll: false });
              } catch (error: any) {
                alert(error.message);
              }
            }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        )}
      </BackHeader>
      <div className={s.container}>
        <AuthorInfo navigateToProfile={navigateToProfile} post={post} />
        <Input
          role="textbox"
          element={InputRef}
          contentEditable={canEdit ? true : false}
          style={{
            cursor: canEdit ? "initial" : "default",
          }}
          // onInput={(e) => {
          //   setvalue(
          //     e.currentTarget.innerHTML
          //       .replaceAll("<div>", "")
          //       .replaceAll("</div>", "")
          //       .replace("<div>", "<br>")
          //       .replaceAll("<div><br><div>", "<br>")
          //       .replaceAll("<br><div>", "<br>")
          //       .replace("</div>", "")
          //   );
          // }}
          dangerouslySetInnerHTML={{ __html: client ? text : "" }}
        ></Input>
        <PhotoLayout
          margin={canEdit ? true : false}
          deleteFile={deleteFile}
          setdeleteFile={setdeleteFile}
          myPost={post}
          edit={canEdit ? true : false}
          files={files}
          setFiles={setFiles}
        />
        {canEdit ? (
          <div className={s.footer}>
            <button
              aria-label="upload media"
              title="Upload media"
              disabled={canEdit ? false : true}
              tabIndex={-1}
              onClick={() => {
                fileRef?.current?.click();
                console.log(files);
              }}
            >
              <FontAwesomeIcon icon={faPhotoFilm} />
            </button>
            <MediaInput
              setFiles={setFiles}
              files={files as File[]}
              fileRef={fileRef}
            />
            <SelectVisiblity
              defaultValue={post.visibility}
              disabled={canEdit ? false : true}
              onChange={(e) => {
                setVisibility(e.target.value);
              }}
            />
          </div>
        ) : (
          <Footer style={{ borderBottom: "1px solid rgb(235, 235, 235)" }} />
        )}
      </div>
    </div>
  );
}
