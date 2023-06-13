import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import { ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import BackHeader from "../../components/Header/BackHeader";
import Input from "../../components/Input";
import PhotoLayout from "../../components/Post/PhotoLayout";
import { app, storage } from "../../lib/firebase";
import s from "../../styles/Home.module.scss";
export default function AddPost() {
  const router = useRouter();
  const textRef = useRef<HTMLDivElement>(null);
  const [visibility, setvisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  // const [files, setFiles] = useState(["1.gif", "2.gif", "3.jpg", "4.png"]);
  // const [files, setFiles] = useState<File>([{ id: 1, name: "1.gif" }]);
  const [files, setFiles] = useState<File[]>([]);
  useEffect(() => {
    textRef.current?.focus();
    const input = textRef.current;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (input?.textContent && files) {
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
        files &&
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
  // const [files, setFiles] = useState(["1.gif", "2.gif", "3.jpg"]);
  // const [files, setFiles] = useState<File[]>([]);
  // const sanitizer = new Sanitizer();
  // Points to the root reference
  const storageRef = ref(storage);
  // Note that you can use variables to create child values
  // const fileName = "images/Screenshot (181).png";
  const fileName = "images";
  const spaceRef = ref(storageRef, fileName);

  // File path is 'images/space.jpg'
  const path = spaceRef.fullPath;
  // File name is 'space.jpg'
  const name = spaceRef.name;
  const imagesRefAgain = spaceRef.parent;
  // const storageRef = ref(storage, "some-child");

  // 'file' comes from the Blob or File API

  // console.log([path, spaceRef.name, spaceRef.parent]);
  // getDownloadURL(spaceRef)
  //   .then((url) => {
  //     console.log(url);
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     alert(error);
  //   });
  const dummyRef = useRef<HTMLDivElement>(null);
  const [fileLoading, setFileLoading] = useState(false);
  useEffect(() => {
    if (fileLoading) return;
    dummyRef.current?.scrollIntoView();
    // const height = dummyRef.current?.clientHeight;

    // const element = dummyRef.current;
    // console.log(element?.parentElement);
    // console.log(height);
    // element?.parentElement?.scrollTo({ top: height });
    // Scroll to the latest item in the file list
    // if (fileListRef.current) {
    //   const fileList = fileListRef.current;
    //   fileList.scrollTop = fileList.scrollHeight;
    // }
  }, [fileLoading, files]);
  return (
    <div
      // ref={dummyRef}
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
              for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const filename = file.name;
                // const filetype = file.type;
                const fileType = file.type;
                console.log(file.type);
                if (
                  fileType === "image/jpeg" ||
                  fileType === "image/jpg" ||
                  fileType === "image/png" ||
                  fileType === "image/gif" ||
                  fileType === "video/mp4"
                ) {
                  const fileRef = ref(
                    storageRef,
                    fileType !== "video/mp4"
                      ? `images/${filename}`
                      : `videos/${filename}`
                  );

                  // Upload the file to Firebase Storage
                  uploadBytes(fileRef, file).then((snapshot) => {
                    console.log(snapshot.ref);
                  });
                } else {
                  alert(
                    `${fileType} is Invalid Type .\nJPEG , PNG , GIF and MP4 are only Allowed !`
                  );
                }

                // Create a storage reference for each file
              }

              // await addPost(uid, files, replace, visibility);
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
          // handleInput(e);
          // setOriginalStr(originalStr + e.currentTarget.innerHTML);

          if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
            // e.preventDefault(); // Prevent default behavior of Enter key

            const element = textRef.current;
            const selection = window.getSelection();
            const range = selection?.getRangeAt(0)!;
            const startOffset = range.startOffset;

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

            // e.preventDefault();
            // setText((prevText) => prevText + "\n");
            // setOriginalStr((prev) => prev.replace(/<div>/g, "<br>"));
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
          // setOriginalStr(e.currentTarget.innerHTML.replace(/<div>/g, "<br>"));
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
          // setOriginalStr(e.currentTarget.innerHTML.replace(/<div>/g, "<br>"));
          // setOriginalStr(e.currentTarget.innerHTML.replace(/<div>/g, "<br>"));
          // console.log(e.currentTarget.innerHTML);
          // setOriginalStr(e.currentTarget?.innerText);
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
              .replace(/<\/?(?:span|p|div)[^>]*>/gi, "")
            // .replace(/<[^>]+>/g, "")
          );
          // setContent((prev) => replace + prev);
        }}
        element={textRef}
        contentEditable
      ></Input>
      {/* <img src="https://firebasestorage.googleapis.com/v0/b/facebook-37f93.appspot.com/o/Screenshot%20(181).png?alt=media&token=7e481983-25bb-4e08-ad9c-f746f2e9658b"></img> */}
      <PhotoLayout
        dummyRef={dummyRef}
        setFiles={setFiles}
        files={files}
        edit={true}
      />
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
            const fileArray = Array.from(e.target.files ?? []);
            let valid = true;
            fileArray.map((file) => {
              const fileType = file.type;
              if (
                fileType === "image/jpeg" ||
                fileType === "image/jpg" ||
                fileType === "image/png" ||
                fileType === "image/gif" ||
                fileType === "video/mp4"
              ) {
                console.log(
                  `File '${file.name}' is an image (JPEG, PNG, or GIF) or an MP4 video`
                );
              } else {
                alert(
                  `File '${file.name}' is not one of the specified formats.\nJPEG , PNG , GIF and MP4 are only Allowed !`
                );
                valid = false;
              }
            });
            setFileLoading(true);
            if (valid) {
              // setFiles(...files, fileArray);
              setFiles([...files, ...fileArray]);
              // dummyRef.current?.scrollIntoView();
            }
            // console.log();

            setTimeout(() => {
              setFileLoading(false);
            }, 500);
            // console.log(
            //   e.currentTarget.parentElement?.parentElement?.parentElement
            // );
            // if (dummyRef.current) {
            //   dummyRef.current.scrollIntoView({
            //     behavior: "smooth",
            //     block: "end",
            //   });
            // }
            // e.currentTarget.parentElement?.parentElement?.scrollTo({
            //   top: -100000,
            // });

            // e.currentTarget.parentElement.parentElement.parentElement.scrollTop =
            //   e.currentTarget.parentElement.parentElement.parentElement
            //     .scrollHeight - 1000;

            // if (!e.currentTarget?.parentElement?.parentElement?.parentElement)
            //   return;
            // e.currentTarget.parentElement.parentElement.parentElement.scrollTo({
            //   // top: 10000 + 100,
            //   top: e.currentTarget.parentElement.parentElement.parentElement
            //     .clientHeight,
            // });

            // e.currentTarget.parentElement?.parentElement?.parentElement?.scrollTo(
            //   {
            //     top:
            //       e.currentTarget.parentElement?.parentElement?.scrollHeight -
            //       1000,
            //     // top:
            //     //   e.currentTarget.parentElement?.parentElement?.parentElement
            //     //     .clientHeight + 200,
            //     // top:
            //     //   e.currentTarget.parentElement.parentElement.clientHeight +
            //     //   e.currentTarget.parentElement.parentElement.scrollHeight,
            //   }
            // );
            console.log(
              e.currentTarget.parentElement?.parentElement?.offsetHeight
            );
            // console.log(e.currentTarget.parentElement?.parentElement);
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
  // dangerouslySetInnerHTML={{
  //         __html: content.replaceAll(/<\/?[^>]+(>|$)/gi, ""),
  //       }}
}
