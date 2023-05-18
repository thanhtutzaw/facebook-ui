import React from "react";
import s from "../../styles/Home.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import BackHeader from "../../components/Header/BackHeader";
export default function AddPost() {
  const router = useRouter();
  return (
    <div className={s.addPost}>
      <BackHeader>
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
      </BackHeader>
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
