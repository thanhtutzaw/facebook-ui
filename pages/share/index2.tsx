import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import BackHeader from "../../components/Header/BackHeader";
import Input from "../../components/Input/Input";
import MediaInput from "../../components/Input/MediaInput";
import PhotoLayout from "../../components/Post/PhotoLayout";
import { SelectVisiblity } from "../../components/Post/SelectVisiblity";
import { PageContext, PageProps } from "../../context/PageContext";
import { app } from "../../lib/firebase";
import { addPost } from "../../lib/firestore/post";
import { uploadMedia } from "../../lib/storage";
import s from "../../styles/Home.module.scss";
import { Post } from "../../types/interfaces";
import useLocalStorage from "../../hooks/useLocalStorage";
import FooterInput from "../../components/Input/FooterInput";
export default function AddPost() {
  const router = useRouter();
  const textRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[] | Post["media"]>([]);
  const [value, setvalue] = useState("");
  const [visibility, setVisibility] = useState(value);
  const { setLocal } = useLocalStorage("visibility", value);
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
  const auth = getAuth(app);
  // const text = textRef.current?.innerHTML.replaceAll("<div>", "hello");
  // .replace(/<div>/g, "<br>")!
  // const [replacedStr, setReplacedStr] = useState(originalStr);
  // const [replacedStr, setReplacedStr] = useState("<h1>u</h1>");

  // const replace = str.replaceAll(/<div>/g, "<br>");
  // useEffect(() => {
  //   const element = textRef.current;
  //   if (element) {
  //     const replacedHTML = element.innerHTML.replace(/<div>/g, "<br>");
  //   }
  // }, [originalStr]);

  const handleInput = (e: {
    currentTarget: { innerHTML: any; textContent: string };
  }) => {
    if (!textRef.current) return;
    const inputValue = e.currentTarget?.innerHTML;
    // setText(inputValue.replace(/<div>/g, "<br>"));
    // setText(e.currentTarget.innerHTML.replace(/<div>/g, "<br>"));
    // setText(
    //   (prev) => prev + textRef.current?.innerHTML.replace(/<div>/g, "<br>")
    // );
  };

  const handleContentChange = (e: { currentTarget: { innerHTML: string } }) => {
    // const selection = window.getSelection();
    // const range = selection?.getRangeAt(0);
    // if (!range || !selection) return;
    // const { startOffset, endOffset } = range;
    // range.setStart(range.startContainer, startOffset);
    // range.setEnd(range.endContainer, endOffset);
    // selection.removeAllRanges();
    // selection.addRange(range);

    // const updatedContent = textRef.current?.innerHTML?.replace(
    //   /<div>/g,
    //   "<br>"
    // );
    // const updatedContent = textRef?.current?.innerHTML.replace(
    //   /<div>/g,
    //   "<br>"
    // );
    if (!textRef.current || textRef.current.textContent) return;
  };
  const replace = useRef("");
  const { fileRef, uploadButtonClicked, setuploadButtonClicked } = useContext(
    PageContext
  ) as PageProps;
  const dummyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (uploadButtonClicked) {
      fileRef?.current?.click();
      setuploadButtonClicked?.(false);
    }
  }, [fileRef, setuploadButtonClicked, uploadButtonClicked]);
  // if (!auth?.currentUser?.uid) return <p>Redirecting... to /login</p>;
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
            if (textRef.current.innerHTML === "" && files?.length == 0) return;
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
              // console.log(replace.current);
              // console.log(textRef.current.innerHTML);
              router.replace("/", undefined, { scroll: false });
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
  //         __html: content.replaceAll(/<\/?[^>]+(>|$)/gi, ""),
}
