import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { RefObject } from "react";
import MediaInput from "./MediaInput";
import { SelectVisiblity } from "../Post/SelectVisiblity";
import s from "../../styles/Home.module.scss";
import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { Post } from "../../types/interfaces";
function FooterInput(props: {
  setLocal?: Function;
  fileRef: RefObject<HTMLInputElement>;
  setFiles: Function;
  files: Post["media"] | File[];
  setVisibility: Function;
  visibility: string;
}) {
  const { setLocal, fileRef, setFiles, files, setVisibility, visibility } =
    props;
  return (
    <div className={s.footer}>
      <button
        aria-label="upload media"
        title="Upload media"
        tabIndex={-1}
        onClick={() => {
          fileRef?.current?.click();
        }}
      >
        <FontAwesomeIcon icon={faPhotoFilm} />
      </button>
      <MediaInput
        setFiles={setFiles}
        files={files as File[]}
        fileRef={fileRef}
      />
      <SelectVisiblity
        value={visibility}
        onChange={(e) => {
          setVisibility(e.target.value);
          setLocal?.(e.target.value);
        }}
      />
    </div>
  );
}

export default FooterInput;
