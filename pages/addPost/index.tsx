import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";
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

  useEffect(() => {
    textRef.current?.focus();
    const input = textRef.current;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (input?.textContent) {
        e.preventDefault();
        e.returnValue = ""; // Chrome requires this line
        // history.pushState(null, document.title, location.href);
      }
    };
    const handlePopState = (e: PopStateEvent) => {
      if (input?.textContent) {
        e.preventDefault();
        history.forward();
        // history.go(1);
        // history.back();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };

    // if (input?.textContent !== myPost.text) {
    //   history.pushState(null, document.title, window.location.href);
    // }
    // window.onpopstate = () => {
    //   // history.pushState(null, document.title, window.location.href);
    //   if (input?.textContent !== myPost.text) {
    //     window.history.go(1);
    //     if (window.location.hash === "#home") {
    //       alert("exit without saving");
    //     }
    //   }
    // };
  }, []);
  const auth = getAuth(app);
  return (
    <div className={s.addPost}>
      <BackHeader
        onClick={() => {
          textRef.current?.focus();
          if (textRef.current?.textContent) {
            // alert("exit without saving");
          } else {
            router.back();
          }
        }}
      >
        {/* <h2>{textRef.current?.textContent === ""}</h2> */}
        <h2>Create Post</h2>
        <button
          type="submit"
          className={s.submit}
          onClick={async () => {
            textRef.current?.focus();
            const uid = auth.currentUser?.uid;
            if (!textRef.current || !textRef.current.textContent || !uid)
              return;
            try {
              await addPost(uid, textRef.current.textContent, visibility);
              router.replace("/", undefined, { scroll: false });
            } catch (error: any) {
              alert(error.message);
            }
          }}
        >
          Post
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
            {/* <option disabled value="friends" key="Friends"> */}
            Friends
          </option>
          <option value="Onlyme" key="Only Me">
            {/* <option disabled value="onlyme" key="Only Me"> */}
            Only Me
          </option>
        </select>
      </div>
    </div>
  );
}
