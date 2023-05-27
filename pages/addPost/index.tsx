import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import BackHeader from "../../components/Header/BackHeader";
import { app } from "../../lib/firebase";
import { addPost } from "../../lib/firestore/post";
import s from "../../styles/Home.module.scss";
export default function AddPost() {
  const router = useRouter();
  const textRef = useRef<HTMLDivElement>(null);
  const [visibility, setvisibility] = useState("public");
  useEffect(() => {
    textRef.current?.focus();
  }, []);
  const auth = getAuth(app);
  return (
    <div className={s.addPost}>
      <BackHeader
        onClick={() => {
          textRef.current?.focus();
          if (textRef.current?.textContent) {
            alert("exit without saving");
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
      <div className={s.input}>
        <div
          ref={textRef}
          contentEditable
          suppressContentEditableWarning={true}
        ></div>
      </div>
      <div className={s.footer}>
        <button
          onClick={() => {
            // router.back();
          }}
        >
          <FontAwesomeIcon icon={faPhotoFilm} />
        </button>
        <select
          onChange={(e) => {
            setvisibility(e.target.value);
          }}
        >
          <option value="public" key="Public">
            Public
          </option>
          <option value="friends" key="Friends">
            {/* <option disabled value="friends" key="Friends"> */}
            Friends
          </option>
          <option value="onlyme" key="Only Me">
            {/* <option disabled value="onlyme" key="Only Me"> */}
            Only Me
          </option>
        </select>
      </div>
    </div>
  );
}
