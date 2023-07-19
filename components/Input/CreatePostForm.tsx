import { auth } from "firebase-admin";
import router, { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import { uploadMedia } from "../../lib/storage";
import { addPost } from "../../lib/firestore/post";
import BackHeader from "../Header/BackHeader";
import PhotoLayout from "../Post/PhotoLayout";
import FooterInput from "./FooterInput";
import Input from "./Input";
import { getAuth } from "firebase/auth";
import { app } from "../../lib/firebase";
import useLocalStorage from "../../hooks/useLocalStorage";
import { Post as PostTypes } from "../../types/interfaces";
import s from "../../styles/Home.module.scss";
import Post from "../Post";
import Link from "next/link";
import error from "next/error";

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
  const { fileRef, uploadButtonClicked, setuploadButtonClicked } = useContext(
    PageContext
  ) as PageProps;

  useEffect(() => {
    setvalue(localStorage.getItem("visibility")!);
    const value = localStorage.getItem("visibility");
    setVisibility(value!);
  }, [visibility]);

  useEffect(() => {
    const input = textRef.current;
    input?.focus();

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (input?.textContent || files?.length! > 0) {
        e.preventDefault();
        console.log(e);
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
        // router.back();
        //This code work but I want to display Leave Propmt , instead confirm box
        // history.pushState(null, document.title, currentPath);
        // return false;
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
  const { author, id } = router.query;
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
              // await addPost(uid, media, replace.current, visibility);
              // const media = await uploadMedia(files as File[]);
              // const sharePost2 = {
              //   author: sharePost?.authorId?.toString()!,
              //   id: sharePost?.id?.toString()!,
              // };
              // console.log(sharePost2);
              // await addPost(
              //   uid,
              //   visibility,
              //   replace.current,
              //   media,
              //   sharePost && sharePost2
              // );
              // router.replace("/", undefined, { scroll: false });
            } catch (error: any) {
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
            // e.preventDefault();
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
      {sharePost && (
        <Link style={{ scale: ".9", display: "flex" }} href={`${author}/${id}`}>
          <Post shareMode={true} post={sharePost} />
        </Link>
      )}
      <FooterInput
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
