import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import router, { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import BackHeader from "../../components/Header/BackHeader";
import { app } from "../../lib/firebase";
import { addPost } from "../../lib/firestore/post";
import s from "../../styles/Home.module.scss";
import Input from "../../components/Input";
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
  return (
    <div className={s.addPost}>
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
            const text = textRef.current.innerHTML.replace(/\n/g, "<br>");
            setLoading(true);
            try {
              setLoading(true);
              await addPost(uid, text, visibility);
              // console.log(textRef.current.innerHTML);
              router.replace("/", undefined, { scroll: false });
            } catch (error: any) {
              alert(error.message);
            } finally {
              // setLoading(false);
            }
          }}
        >
          {loading ? "Saving..." : "Post"}
        </button>
      </BackHeader>
      <Input element={textRef} contentEditable></Input>
      <div className={s.footer}>
        <button tabIndex={-1} onClick={() => {}}>
          <FontAwesomeIcon icon={faPhotoFilm} />
        </button>
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
