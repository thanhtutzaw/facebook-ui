import { getAuth } from "firebase/auth";
import { collection, doc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import useLocalStorage from "../../hooks/useLocalStorage";
import { app, db } from "../../lib/firebase";
import { addPost } from "../../lib/firestore/post";
import { uploadMedia } from "../../lib/storage";
import s from "../../styles/Home.module.scss";
import { Post as PostTypes } from "../../types/interfaces";
import BackHeader from "../Header/BackHeader";
import PhotoLayout from "../Post/PhotoLayout";
import { SharePreview } from "../Post/SharePreview";
import PostSettingFooterForm from "./PostSettingFooterForm";
import Input from "./Input";

export default function CreatePostForm(props: { sharePost?: PostTypes }) {
  const { sharePost } = props;
  const dummyRef = useRef<HTMLDivElement>(null);
  const replace = useRef("");
  const auth = getAuth(app);
  const router = useRouter();
  const textRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[] | PostTypes["media"]>([]);
  const [value, setvalue] = useState("");
  const [visibility, setVisibility] = useState(value);
  const { setLocal } = useLocalStorage("visibility", value);
  const { friends, fileRef, uploadButtonClicked, setuploadButtonClicked } =
    useContext(PageContext) as PageProps;

  useEffect(() => {
    setvalue(localStorage.getItem("visibility")!);
    const value = localStorage.getItem("visibility");
    setVisibility(value ?? "Public");
  }, [visibility]);

  useEffect(() => {
    const input = textRef.current;
    input?.focus();

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (input?.textContent || files?.length! > 0) {
        e.preventDefault();
        e.returnValue = ""; // Chrome requires this line
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [files]);
  useEffect(() => {
    router.beforePopState(({ as }) => {
      const currentPath = router.asPath;
      if (
        (as !== currentPath && textRef.current?.textContent) ||
        (files?.length !== 0 && !confirm("Changes you made may not be saved."))
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
  }, [files, router]);
  useEffect(() => {
    if (uploadButtonClicked) {
      fileRef?.current?.click();
      setuploadButtonClicked?.(false);
    }
  }, [fileRef, setuploadButtonClicked, uploadButtonClicked]);
  const { setshareAction } = useContext(PageContext) as PageProps;
  useEffect(() => {
    setshareAction?.("");
  }, [setshareAction]);
  // console.log(friends);
  return (
    <div
      style={{
        pointerEvents: loading ? "none" : "initial",
        cursor: loading ? "wait" : "default",
      }}
      className={s.addPost}
    >
      <BackHeader
        onClick={() => {
          textRef.current?.focus();
          router.back();
        }}
      >
        <div
          style={{
            display: "flex",
            flex: "1",
            overflow: "hidden",
          }}
        >
          <h2
            style={{
              width: "initial",
              flex: "initial",
            }}
            className={s.title}
          >
            Create Post
          </h2>
        </div>
        <button
          disabled={loading}
          type="submit"
          className={s.submit}
          tabIndex={1}
          onClick={async () => {
            textRef.current?.focus();
            const uid = auth.currentUser?.uid;
            if (!textRef.current || !uid) return;
            if (
              textRef.current.innerHTML === "" &&
              !sharePost &&
              files?.length == 0
            )
              return;
            // const text = textRef.current.innerHTML
            //   .replaceAll("</div>", "")
            //   .replace("<div>", "<br>")
            //   .replaceAll("<div><br><div>", "<br>")
            //   .replaceAll("<br><div>", "<br>");
            // .replace("</div>", "");
            // .replaceAll("<div><br>", "<br>")
            // .replaceAll("<br></div>", "<br>")

            // .replaceAll("<div><br>", "")
            // .replace("</div>", "<br>")
            // .replace("<br></div>", "<br>")
            // .replaceAll("<div>", "<br>")
            // .replaceAll("<div>", "<br>")
            // .replace("</div>", "");

            // .replace("<div>", "")
            // .replaceAll("</div><div>", "<br>");

            // .replaceAll("<div>", "<br>")
            // .replace("<br>", "")
            // .replaceAll("</div>", "");

            // .replace(/\n/g, "<br>");
            // .replace(/<div>/g, "")
            // .replaceAll("</div>", "")
            // const text = textRef.current.innerHTML
            //   .replace(/\n/g, "<br>")
            //   .replaceAll("&nbsp;", " ");

            setLoading(true);
            try {
              setLoading(true);
              window.document.body.style.cursor = "wait";
              const media = await uploadMedia(files as File[]);
              const shareRef = doc(collection(db, `users/${uid}/posts`));
              const sharePostData = {
                id: sharePost?.id?.toString()!,
                author: sharePost?.authorId?.toString()!,
                sharer: [{ id: uid }],
                refId: shareRef.id,
              };
              await addPost(
                uid,
                visibility,
                replace.current,
                media,
                sharePost ? sharePostData : null,
                friends
              );
              router.replace("/", undefined, { scroll: false });
              window.document.body.style.cursor = "initial";
            } catch (error: any) {
              setLoading(false);
              alert(error.message);
            } finally {
              window.document.body.style.cursor = "initial";
            }
          }}
        >
          {loading ? "Saving..." : "Post"}
        </button>
      </BackHeader>
      <Input
        style={{ direction: "ltr" }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
            // const element = textRef.current;
            // const selection = window.getSelection();
            // const range = selection?.getRangeAt(0)!;
            // const startOffset = range.startOffset;
            // let content = element?.innerHTML;
            // const beforeCursor = content?.slice(0, startOffset);
            // const afterCursor = content?.slice(startOffset);
            // content = `${beforeCursor}<br>${afterCursor}`;
            // if (!element) return;
            // element.innerHTML = content;
            // const textNode = element.firstChild;
            // const newRange = document.createRange();
            // if (!textNode) return;
            // newRange.setStart(textNode, startOffset);
            // newRange.collapse(true);
            // if (!selection) return;
            // selection.removeAllRanges();
            // selection.addRange(newRange);
            // setText((prevText) => prevText + "\n");
          }
        }}
        onChange={(e) => {
          // const selection = window.getSelection();
          // const range = selection?.getRangeAt(0);
          // if (!range || !selection) return;
          // const { startOffset, endOffset } = range;
          // range.setStart(range.startContainer, startOffset);
          // range.setEnd(range.endContainer, endOffset);
          // selection.removeAllRanges();
          // selection.addRange(range);
          // console.log(e.currentTarget.innerHTML);
        }}
        onKeyUp={(e) => {
          // e.currentTarget.innerHTML = e.currentTarget.innerHTML
          //   .replaceAll("</div>", "")
          //   .replace("<div>", "<br>")
          //   .replaceAll("<div><br><div>", "<br>")
          //   .replaceAll("<br><div>", "<br>")
          //   .replaceAll(
          //     /(?:https?|ftp):\/\/[\n\S]+/g,
          //     (url) =>
          //       `<a rel="nofollow" target="_blank" tabindex="0" href="${url}">${url}</a>`
          //   )
          //   .replace(/<\/?(?:span|p|div)[^>]*>/gi, "");
          // handleInput(e);
          // text.replaceAll("<div><br></div>", "\n");
          // const element = textRef.current;
          // const selection = window.getSelection();
          // const range = selection?.getRangeAt(0);
          // const startOffset = range?.startOffset!;
          // const textNode = element?.firstChild;
          // const newRange = document.createRange();
          // if (!textNode || e.key === "Enter") return;
          // if (startOffset === 0 && textNode.nodeType === Node.TEXT_NODE) {
          //   // Handle cursor at the beginning of a new line
          //   newRange.setStartAfter(textNode);
          //   newRange.collapse(true);
          // } else {
          //   newRange.setStart(textNode, startOffset);
          //   newRange.collapse(true);
          // }
          // if (!selection) return;
          // selection.removeAllRanges();
          // selection.addRange(newRange);
        }}
        onInput={(e) => {
          replace.current = e.currentTarget.innerHTML
            .replaceAll("</div>", "")
            .replace("<div>", "<br>")
            .replaceAll("<div><br><div>", "<br>")
            .replaceAll("<br><div>", "<br>")
            .replaceAll(
              /(?:https?|ftp):\/\/[\n\S]+/g,
              (url) =>
                `<a rel="nofollow" target="_blank" tabindex="0" href="${url}">${url}</a>`
            )
            .replace(/<\/?(?:span|p|div)[^>]*>/gi, "");
        }}
        element={textRef}
        contentEditable
      />
      <PhotoLayout
        dummyRef={dummyRef}
        setFiles={setFiles}
        files={files!}
        edit={true}
      />
      {router.query.author && (
        <SharePreview query={router.query} post={sharePost!} />
      )}
      <PostSettingFooterForm
        fileRef={fileRef!}
        files={files}
        setFiles={setFiles}
        visibility={visibility}
        setVisibility={setVisibility}
        setLocal={setLocal}
      />
    </div>
  );
}
