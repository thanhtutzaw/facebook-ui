/* eslint-disable @next/next/no-img-element */
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RefObject, useEffect } from "react";
import { Post } from "../../types/interfaces";
import s from "./Post.module.scss";
import { log } from "console";
export default function PhotoLayout(props: {
  deleteFile?: Post["media"] | File[];
  files: Post["media"] | File[];
  setFiles?: Function;
  setdeleteFile?: Function;
  preview?: boolean;
  edit?: boolean;
  uid?: string;
  myPost?: Post;
  dummyRef?: RefObject<HTMLDivElement>;
}) {
  const {
    deleteFile,
    setdeleteFile,
    files,
    setFiles,
    preview = false,
    edit,
    uid,
    myPost,
  } = props;
  // const placeholder = "https://via.placeholder.com/350x388";

  const placeholder =
    "https://www.cvent-assets.com/brand-page-guestside-site/assets/images/venue-card-placeholder.png";
  if (!preview) {
    return (
      <div className={s.media}>
        {files &&
          files.map((file: any, i: number) => (
            <div key={i} id={i.toString()}>
              {file.type === "video/mp4" ? (
                <video controls src={URL.createObjectURL(file)} />
              ) : (
                <img
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.src = placeholder;
                    img.alt = "Not Found !";
                    img.style.filter = "invert(1)";
                    img.style.minHeight = "394px";
                  }}
                  alt={file.name}
                  src={
                    !file.url ? URL.createObjectURL(file) : file.url
                    // Array.isArray(files) &&
                    // files.every((file) => file instanceof File)
                    //   ? URL.createObjectURL(file)
                    //   : file.url
                  }
                />
              )}
              {edit && myPost?.authorId === uid && (
                <button
                  onClick={(e) => {
                    if (file.url) {
                      const media = files as Post["media"];
                      const data = media?.filter((_, index) => index === i);
                      // setdeleteFile([
                      //   ...deleteFile! ?? [],
                      //   media?.filter((_, index) => index === i)
                      // ]);
                      // setdeleteFile([...deleteFile??[], data]);
                      setdeleteFile?.([...(deleteFile ?? []), ...(data ?? [])]);
                    }
                    // e.currentTarget.scrollIntoView();
                    setFiles?.([...files.slice(0, i), ...files.slice(i + 1)]);
                    // setFiles(files.filter((_, index) => index !== i));
                    // setFiles(files.splice(i, 1));
                  }}
                  aria-label="remove media"
                  tabIndex={-1}
                  className={s.deletePhoto}
                >
                  <FontAwesomeIcon icon={faClose} />
                </button>
              )}
            </div>
          ))}
      </div>
    );
  }
  const media = files as Post["media"];
  if (!files || !media) return <></>;

  return (
    <div
      style={{
        overflow: "hidden",
      }}
    >
      <div className={s.preview}>
        {media[0] && (
          <div
            style={{
              // minHeight: files?.length !== 1 ? "initial" : "394px",
              aspectRatio: files?.length <= 2 ? "initial" : "9/10",
              justifyContent: "center",
              // alignItems: "center",
            }}
          >
            <img
              onError={(e) => {
                const img = e.currentTarget;
                img.src = placeholder;
                img.alt = "Not Found !";
                img.style.filter = "invert(1)";
                img.style.minHeight = media.length === 2 ? "196px" : "394px";
              }}
              // onError={(e) => {
              //   // e.stopPropagation();
              //   const placeholder = "https://via.placeholder.com/350x388";
              //   const img = e.currentTarget;
              //   console.log(e);
              //   img.src = placeholder;
              //   img.alt = "Not Found !";
              // }}
              style={{
                maxWidth: "100%",
                margin: "0 auto",
              }}
              src={media[0].url}
              alt={media[0].name}
            />
          </div>
        )}
        <div>
          {media[1] && (
            <img
              onError={(e) => {
                const img = e.currentTarget;
                img.src = placeholder;
                img.alt = "Not Found !";
                img.style.filter = "invert(1)";
                img.style.minHeight = "196px";
              }}
              style={{
                maxWidth: "100%",
                margin: "0 auto",
              }}
              src={media[1].url}
              alt={media[1].name}
            />
          )}
          {media[2] && (
            <div
              style={{
                display: "flex",
                position: "relative",
              }}
            >
              <img
                onError={(e) => {
                  const img = e.currentTarget;
                  img.src = placeholder;
                  img.alt = "Not Found !";
                  img.style.filter = "invert(1)";
                  img.style.minHeight = "196px";
                }}
                style={{
                  maxWidth: "100%",
                  margin: "0 auto",
                }}
                src={media[2].url}
                alt={media[2].name}
              />
              {files.length - 3 !== 0 && (
                <h2 className={s.backDrop}>+{files.length - 3}</h2>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
