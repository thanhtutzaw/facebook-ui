import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { RefObject } from "react";
import { SelectVisiblity } from "../Post/SelectVisiblity";
import s from "../../styles/Home.module.scss";
import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { Post } from "../../types/interfaces";
import MediaInput from "./Input/MediaInput";
function PostSettingFooterForm(props: {
  fileRef: RefObject<HTMLInputElement>;
  setLocal?: Function;
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

      {!setLocal ? (
        <SelectVisiblity
          defaultValue={visibility}
          onChange={(e) => {
            setVisibility(e.target.value);
          }}
        />
      ) : (
        <SelectVisiblity
          value={visibility}
          onChange={(e) => {
            setVisibility(e.target.value);
            setLocal?.(e.target.value);
          }}
        />
      )}
    </div>
  );
}

export default PostSettingFooterForm;