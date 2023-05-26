import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import BackHeader from "../../components/Header/BackHeader";
import s from "../../styles/Home.module.scss";
import { addPost } from "../../lib/firestore/post";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Props } from "../../types/interfaces";
import { getAuth } from "firebase/auth";
import { app } from "../../lib/firebase";
import error from "next/error";
export default function AddPost() {
  const router = useRouter();
  const textRef = useRef<HTMLDivElement>(null);
  const [visibility, setvisibility] = useState("public");
  useEffect(() => {
    textRef.current?.focus();
  }, []);
  // const { uid } = useContext(AppContext) as Props;
  const auth = getAuth(app);
  return (
    <div className={s.addPost}>
      <BackHeader>
        <h2>Create Post</h2>

        <button
          type="submit"
          className={s.submit}
          onClick={() => {
            textRef.current?.focus();
            const uid = auth.currentUser?.uid;
            if (!textRef.current || !textRef.current.textContent || !uid)
              return;
            try {
              addPost(uid, textRef.current.textContent, visibility);
              router.push("/");
              router.replace(router.asPath);
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
            // alert(e.target.value);
          }}
        >
          <option value="public" key="Public">
            Public
          </option>
          <option disabled value="friends" key="Friends">
            Friends
          </option>
          <option disabled value="onlyme" key="Only Me">
            Only Me
          </option>
        </select>
      </div>
    </div>
  );
}
