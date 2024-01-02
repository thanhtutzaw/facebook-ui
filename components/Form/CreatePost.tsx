import { usePageContext } from "@/context/PageContext";
import useEnterSave from "@/hooks/useEnterSave";
import useLocalStorage from "@/hooks/useLocalStorage";
import { app, getPath } from "@/lib/firebase";
import { addPost } from "@/lib/firestore/post";
import { uploadMedia } from "@/lib/storage";
import s from "@/styles/Home.module.scss";
import { Post as PostTypes } from "@/types/interfaces";
import { getAuth } from "firebase/auth";
import { doc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoadingButton } from "../Button/LoadingButton";
import BackHeader from "../Header/BackHeader";
import PhotoLayout from "../Post/PhotoLayout";
import { SharePreview } from "../Post/SharePost/Preview";
import TextInput from "./Input/TextInput";
import PostSettingFooterForm from "./PostSettingFooter";

export default function CreatePostForm(props: { sharePost?: PostTypes }) {
  const { sharePost } = props;
  const dummyRef = useRef<HTMLDivElement>(null);
  const replace = useRef("");
  const auth = getAuth(app);
  const router = useRouter();
  const textRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const { getLocal, setLocal } = useLocalStorage("visibility");
  const [form, setForm] = useState<{
    files: File[] | PostTypes["media"];
    visibility: string;
  }>({
    files: [],
    visibility: "Public",
  });
  const updateForm = useCallback((newForm: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...newForm }));
  }, []);
  const { friends, fileRef, uploadButtonClicked, setuploadButtonClicked } =
    usePageContext();
  const submitRef = useRef<HTMLButtonElement>(null);
  useEnterSave(textRef, submitRef);
  const [input, setinput] = useState("");
  const { files, visibility } = form;
  useEffect(() => {
    // setvalue(localStorage.getItem("visibility")!);
    const value = getLocal() as string;
    // setVisibility(value ?? "Public");
    // setForm?.((prev) => ({ ...prev, visibility: value ?? "Public" }));
    updateForm({ visibility: value ?? "Public" });
  }, [getLocal, updateForm]);
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
  }, [files?.length]);
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
  }, [files?.length, router]);
  useEffect(() => {
    if (uploadButtonClicked) {
      fileRef?.current?.click();
      setuploadButtonClicked?.(false);
    }
  }, [fileRef, setuploadButtonClicked, uploadButtonClicked]);
  const { setshareAction } = usePageContext();
  useEffect(() => {
    setshareAction?.("");
  }, [setshareAction]);
  const dirtyForm = input.length === 0 && form.files?.length === 0;
  return (
    <div
      style={{
        pointerEvents: loading ? "none" : "initial",
        cursor: loading ? "wait" : "default",
      }}
      className={s.addPostForm}
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
        <LoadingButton
          ref={submitRef}
          key={input.length}
          loading={loading}
          dirty={dirtyForm}
          type="submit"
          className={s.submit}
          tabIndex={1}
          onClick={async () => {
            textRef.current?.focus();
            const uid = auth.currentUser?.uid;
            if (!uid) {
              throw new Error("You need to login!");
            }
            if (!textRef.current) return;
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

            try {
              setLoading(true);
              window.document.body.style.cursor = "wait";
              const media = await uploadMedia(files as File[]);
              const shareRef = doc(getPath("posts", { uid }));
              const sharePostData = {
                id: sharePost?.id?.toString()!,
                author: sharePost?.authorId?.toString()!,
                sharer: [{ id: uid }],
                refId: shareRef.id,
              };
              await addPost({
                uid,
                post: {
                  visibility,
                  text: replace.current,
                  media,
                },
                sharePost: sharePost ? sharePostData : null,
                friends: friends!,
              });
              router.replace("/", undefined, { scroll: false });
              window.document.body.style.cursor = "initial";
            } catch (error: unknown) {
              alert(error);
            } finally {
              setLoading(false);
              window.document.body.style.cursor = "initial";
            }
          }}
          aria-label="Create New Post"
          initialTitle="Create new post"
          loadingTitle="Creating new post"
        >
          Post
        </LoadingButton>
      </BackHeader>
      <TextInput
        style={{ direction: "ltr" }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
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
          setinput(e.currentTarget.innerText);
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
        fileRef={fileRef!}
        dummyRef={dummyRef}
        updateForm={updateForm}
        form={form}
        edit={true}
      />
      {router.query.author && (
        <SharePreview query={router.query} post={sharePost!} />
      )}
      <PostSettingFooterForm
        fileRef={fileRef!}
        form={form}
        updateForm={updateForm}
        setLocal={setLocal}
      />
    </div>
  );
}
