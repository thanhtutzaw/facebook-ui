import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RefObject } from "react";
import s from "../../styles/Home.module.scss";
import { Post } from "../../types/interfaces";
import { SelectVisiblity } from "../Post/SelectVisiblity";
import MediaInput from "./Input/MediaInput";
function PostSettingFooterForm(props: {
  fileRef: RefObject<HTMLInputElement>;
  setLocal?: Function;
  form?: {
    files: File[] | Post["media"];
    visibility: string;
  };
  updateForm: Function;
}) {
  const { setLocal, fileRef, form, updateForm } = props;
  const { files, visibility } = form!;
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
        updateForm={updateForm}
        files={files as File[]}
        fileRef={fileRef}
      />

      {!setLocal ? (
        <SelectVisiblity
          defaultValue={visibility}
          onChange={(e) => {
            updateForm({visibility:e.target.value});
          }}
        />
      ) : (
        <SelectVisiblity
          value={visibility}
          onChange={(e) => {
            updateForm({visibility:e.target.value});
            setLocal?.(e.target.value);
          }}
        />
      )}
    </div>
  );
}

export default PostSettingFooterForm;
