/* eslint-disable @next/next/no-img-element */
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import s from "./Post.module.scss";
import { RefObject, useEffect, useState } from "react";
import { Post } from "../../types/interfaces";
import { deleteStorage } from "../../lib/storage";
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
    dummyRef,
    uid,
    myPost,
  } = props;
  useEffect(() => {
    // if (deleteFile?.length !== 0 || deleteFile || deleteFile !== 'undefined') {
    // }
    if (deleteFile) {
      console.log({ deleteFile });
    }
  }, [deleteFile]);

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
                    // if (file.url) {
                    // deleteStorage();
                    // } else {
                    e.currentTarget.scrollIntoView();
                    setFiles?.([...files.slice(0, i), ...files.slice(i + 1)]);
                    // console.log(files.filter((_, index) => index === i));
                    // setFiles(files.filter((_, index) => index !== i));
                    // setFiles(files.splice(i, 1));

                    // }
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
        <div ref={dummyRef}></div>
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
              aspectRatio: files?.length <= 2 ? "initial" : "9/10",
            }}
          >
            <img
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
