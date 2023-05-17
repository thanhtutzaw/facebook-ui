import React from "react";
import s from "../../styles/Home.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
export default function AddPost() {
  const router = useRouter();
  return (
    <div className={s.addPost}>
      <div className={s.header}>
        <button
          onClick={() => {
            router.back();
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2>Create Post</h2>
        <button
          type="submit"
          className={s.submit}
          onClick={() => {
            router.back();
          }}
        >
          Post
        </button>
      </div>
      <div className={s.input}>
        <div contentEditable>
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          fdfdsfsdfdsfdfdfdfsddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
        </div>
      </div>
      <div className={s.footer}>
        <button
          onClick={() => {
            router.back();
          }}
        >
          <FontAwesomeIcon icon={faPhotoFilm} />
        </button>
        {/* <h2>Create Post</h2> */}
      </div>
    </div>
  );
}
