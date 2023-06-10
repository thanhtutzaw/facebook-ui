import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import BackHeader from "../../components/Header/BackHeader";
import Input from "../../components/Input";
import { app } from "../../lib/firebase";
import s from "../../styles/Home.module.scss";
import { addPost } from "../../lib/firestore/post";
import error from "next/error";
import { InputFiles } from "typescript";
export default function AddPost() {
  const router = useRouter();
  const textRef = useRef<HTMLDivElement>(null);
  const [visibility, setvisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    textRef.current?.focus();
    const input = textRef.current;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (input?.textContent) {
        e.preventDefault();
        console.log(e);
        e.returnValue = ""; // Chrome requires this line
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  useEffect(() => {
    // window.addEventListener("click", (e) => {
    //   // console.log(e.currentTarget.textContent);
    //   const target = e.target;
    //   console.log(target);
    // });
    router.beforePopState(({ as }) => {
      const currentPath = router.asPath;
      if (
        as !== currentPath &&
        textRef.current?.textContent &&
        !confirm("Changes you made may not be saved.")
      ) {
        // router.back();
        //This code work but I want to display Leave Propmt , instead confirm box
        history.pushState(null, document.title, currentPath);
        return false;
      }
      return true;
    });
    return () => {
      router.beforePopState(() => true);
    };
  }, [router]);
  const auth = getAuth(app);
  const [text, setText] = useState("");
  // const str = ;
  // const replacedStr = str!;
  // const text = textRef.current?.innerHTML.replaceAll("<div>", "hello");
  // .replace(/<div>/g, "<br>")!
  const [originalStr, setOriginalStr] = useState("<h1>hi</h1><div></div>");
  // const [replacedStr, setReplacedStr] = useState(originalStr);
  // const [replacedStr, setReplacedStr] = useState("<h1>u</h1>");

  // const replace = str.replaceAll(/<div>/g, "<br>");
  // useEffect(() => {
  //   const element = textRef.current;
  //   if (element) {
  //     const replacedHTML = element.innerHTML.replace(/<div>/g, "<br>");
  //     setOriginalStr(replacedHTML);
  //   }
  // }, [originalStr]);

  const handleInput = (e: {
    currentTarget: { innerHTML: any; textContent: string };
  }) => {
    if (!textRef.current) return;
    const inputValue = e.currentTarget?.innerHTML;
    setOriginalStr(inputValue);
    // setText(inputValue.replace(/<div>/g, "<br>"));
    // setText(e.currentTarget.innerHTML.replace(/<div>/g, "<br>"));
    // setText(
    //   (prev) => prev + textRef.current?.innerHTML.replace(/<div>/g, "<br>")
    // );
    // setOriginalStr((prev) => prev + textRef?.current?.innerHTML);
  };
  const [content, setContent] = useState("");

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
    // setContent(content);
    // setContent(updatedContent!);
    // const updatedContent = textRef?.current?.innerHTML.replace(
    //   /<div>/g,
    //   "<br>"
    // );
    if (!textRef.current || textRef.current.textContent) return;
    // console.log("aa " + updatedContent);
  };
  useEffect(() => {
    // const original = textRef.current?.innerHTML;
    // console.log(original);
  }, [content]);
  const [replace, setReplace] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  // useEffect(() => {
  //   console.log(fileRef.current?.files);
  // }, [fileRef.current?.files]);
  // const [files, setFiles] = useState([
  //   "public/1.gif",
  //   "public/2.gif",
  //   "public/3.jpg",
  // ]);
  const [files, setFiles] = useState<File[]>([]);
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
        <h2>Create Post</h2>
        <button
          disabled={loading}
          type="submit"
          className={s.submit}
          onClick={async () => {
            textRef.current?.focus();
            const uid = auth.currentUser?.uid;
            if (!textRef.current || !textRef.current.textContent || !uid)
              return;
            const text = textRef.current.innerHTML
              // .replaceAll("</div><div>", "<br>")
              .replaceAll("</div>", "")
              .replace("<div>", "<br>")
              .replaceAll("<div><br><div>", "<br>")
              .replaceAll("<br><div>", "<br>");
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
            console.log(text);
            setContent(text);
            try {
              setLoading(true);
              window.document.body.style.cursor = "wait";
              await addPost(uid, replace, visibility);
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
          // handleInput(e);
          // setOriginalStr(originalStr + e.currentTarget.innerHTML);

          if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
            // e.preventDefault();
            // setText((prevText) => prevText + "\n");
            // setOriginalStr((prev) => prev.replace(/<div>/g, "<br>"));
          }
        }}
        onChange={(e) => {
          // console.log(e.currentTarget.innerHTML);
          // setOriginalStr(e.currentTarget.innerHTML.replace(/<div>/g, "<br>"));
        }}
        onKeyUp={(e) => {
          // setOriginalStr(e.currentTarget.innerHTML.replace(/<div>/g, "<br>"));
          // setOriginalStr(e.currentTarget.innerHTML.replace(/<div>/g, "<br>"));
          // console.log(e.currentTarget.innerHTML);
          // setOriginalStr(e.currentTarget?.innerText);
          // handleInput(e);
          // text.replaceAll("<div><br></div>", "\n");
        }}
        onInput={(e) => {
          setReplace(
            e.currentTarget.innerHTML
              .replaceAll("</div>", "")
              .replace("<div>", "<br>")
              .replaceAll("<div><br><div>", "<br>")
              .replaceAll("<br><div>", "<br>")
              .replaceAll(
                /(?:https?|ftp):\/\/[\n\S]+/g,
                (url) =>
                  `<a rel="nofollow" target="_blank" tabindex="0" href="${url}">${url}</a>`
              )
          );
        }}
        // text={text}
        element={textRef}
        contentEditable
        dangerouslySetInnerHTML={{
          __html: content,
        }}
      >
        {/* {content} */}
        {/* <div>{replacedStr}</div> */}
        {/* {text.replace("<div>", "\n")} */}
        {/* {text} */}
        {/* {text?.replaceAll("<div>", "")} */}
        {/* {text?.split(/\n/g)} */}
        {/* {text?.replace(/\n/g, "<br>")} */}
      </Input>
      {/* <img
        style={{ maxWidth: "100%", margin: "0 auto" }}
        // src={URL.createObjectURL(files[0])}
        src="public/3.jpg"
        alt="Selected"
      /> */}
      <div
        style={{
          display: "flex",
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {files && files[0] && (
          <div className={s.img1} style={{ display: "flex", minWidth: "50%" }}>
            {files[0].type.startsWith("image/") && (
              <img
                style={{ maxWidth: "100%", margin: "0 auto" }}
                // src={URL.createObjectURL(files[0])}
                src={URL.createObjectURL(files[0])}
                alt="Selected"
              />
            )}
          </div>
        )}
        {/* {files && files[0] && (
          <div className={s.img1} style={{ display: "flex", minWidth: "50%" }}>
            {files[0] && (
              <img
                style={{ maxWidth: "100%", margin: "0 auto" }}
                // src={URL.createObjectURL(files[0])}
                src={files[0]}
                alt="Selected"
              />
            )}
          </div>
        )} */}
        <div>
          {files && files[1] && (
            <div style={{ display: "flex" }}>
              {files[1].type.startsWith("image/") && (
                <img
                  style={{ maxWidth: "100%", margin: "0 auto" }}
                  // src={URL.createObjectURL(files[1])}
                  src={URL.createObjectURL(files[1])}
                  alt="Selected"
                />
              )}
            </div>
          )}
          {files && files[2] && (
            <div style={{ display: "flex" }}>
              {files[2].type.startsWith("image/") && (
                <img
                  style={{ maxWidth: "100%", margin: "0 auto" }}
                  // src={URL.createObjectURL(files[2])}
                  src={URL.createObjectURL(files[2])}
                  alt="Selected"
                />
              )}
            </div>
          )}
        </div>
        {/* {files?.map((file, index) => (
          // <p key={index}>{file.name}</p>
          <div style={{ display: "flex" }} key={index}>
            {file.type.startsWith("image/") && (
              <img
                style={{ maxWidth: "100%", margin: "0 auto" }}
                src={URL.createObjectURL(file)}
                alt="Selected"
              />
            )}
          </div>
        ))} */}
      </div>
      {files.length !== 0 && (
        <p style={{ textAlign: "center" }}>Demo Photo Layout !</p>
      )}
      <div className={s.footer}>
        <button
          tabIndex={-1}
          onClick={() => {
            fileRef?.current?.click();
          }}
        >
          <FontAwesomeIcon icon={faPhotoFilm} />
          {/* {fileRef.current?.files?.item} */}
        </button>
        <input
          multiple
          accept="image/*"
          onChange={(e) => {
            const files = e.target.files;
            const fileArray = Array.from(files ?? []);
            setFiles(fileArray);
          }}
          ref={fileRef}
          style={{ display: "none", visibility: "hidden" }}
          type="file"
        />
        <select
          tabIndex={-1}
          onChange={(e) => {
            setvisibility(e.target.value);
          }}
        >
          <option value="Pubilc" key="Public">
            Public
          </option>
          <option value="Friend" key="Friends">
            Friends
          </option>
          <option value="Onlyme" key="Only Me">
            Only Me
          </option>
        </select>
      </div>
    </div>
  );
}
