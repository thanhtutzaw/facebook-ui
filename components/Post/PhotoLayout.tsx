/* eslint-disable @next/next/no-img-element */
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RefObject, useContext, useEffect, useRef, useState } from "react";
import { Post } from "../../types/interfaces";
import s from "./index.module.scss";
import { ViewModal } from "./ViewModal";

import { PageContext, PageProps } from "../../context/PageContext";
import Image from "next/image";
import ImageWithFallback from "../ImageWithFallback";

export default function PhotoLayout(props: {
  margin?: boolean;
  deleteFile?: Post["media"] | File[];
  files: Post["media"] | File[];
  setFiles?: Function;
  setdeleteFile?: Function;
  preview?: boolean;
  edit?: boolean;
  myPost?: Post;
  dummyRef?: RefObject<HTMLDivElement>;
}) {
  const {
    margin,
    deleteFile,
    setdeleteFile,
    files,
    setFiles,
    preview = false,
    edit,
    myPost,
  } = props;
  // const placeholder = "https://via.placeholder.com/350x388";

  // const placeholder =
  //   "https://www.cvent-assets.com/brand-page-guestside-site/assets/images/venue-card-placeholder.png";
  const [view, setview] = useState({ src: "", name: "" });
  const { uid, viewRef } = useContext(PageContext) as PageProps;
  // useEffect(() => {
  //   window.onpopstate = () => {
  //     // if (viewRef?.current?.open) {
  //     // history.pushState(null, document.title, location.href);
  //     // alert("hety");

  //     // }
  //   };
  // }, [viewRef]);

  // useEffect(() => {
  //   window.onpopstate = () => {
  //     history.pushState(null, document.title, location.hash);
  //     // if (!viewRef.current?.open) return;
  //     // viewRef.current.close();
  //     // if (exitWithoutSaving) {
  //     //   console.log("back (exit without save)");
  //     //   // confirmModalRef.current?.close();
  //     //   // confirmModalRef?.current.showModal();
  //     // } else {
  //     //   console.log("back (just close)");
  //     // }
  //   };
  // }, [viewRef]);
  if (!preview) {
    return (
      <>
        <div
          className={s.media}
          style={{ marginBottom: margin ? "65px" : "initial" }}
        >
          {files &&
            files.map((file: any, i: number) => (
              <div
                onClick={() => {
                  if (file.type === "video/mp4") return;
                  setview({
                    src: !file.url ? URL.createObjectURL(file) : file.url,
                    name: file.name,
                  });
                  if (!viewRef) return;
                  viewRef.current?.showModal();
                }}
                key={i}
                id={i.toString()}
              >
                {file.type === "video/mp4" ? (
                  <video controls src={URL.createObjectURL(file)} />
                ) : (
                  <Image
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    width={700}
                    height={394}
                    alt={file.name}
                    src={
                      !file.url ? URL.createObjectURL(file) : file.url
                      // Array.isArray(files) &&
                      // files.every((file) => file instanceof File)
                      //   ? URL.createObjectURL(file)
                      //   : file.url
                    }
                    style={{ objectFit: "contain", height: "auto" }}
                  />
                )}
                {edit && myPost?.authorId === uid && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (file.url) {
                        const media = files as Post["media"];
                        const data = media?.filter((_, index) => index === i);
                        // setdeleteFile([
                        //   ...deleteFile! ?? [],
                        //   media?.filter((_, index) => index === i)
                        // ]);
                        // setdeleteFile([...deleteFile??[], data]);
                        setdeleteFile?.([
                          ...(deleteFile ?? []),
                          ...(data ?? []),
                        ]);
                      }
                      setFiles?.([...files.slice(0, i), ...files.slice(i + 1)]);
                      // setFiles(files.filter((_, index) => index !== i));
                      // setFiles(files.splice(i, 1));
                      setview({ src: "", name: "" });
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
        <ViewModal view={view} />
      </>
    );
  }
  const media = files as Post["media"];

  if (!files || !media) return <></>;
  // const aspectRatio = myPost?.media?.length! <= 2 ? "initial" : "9/10";
  return (
    <div className={s.preview} style={{ objectFit: "contain" }}>
      {media[0] && (
        <div
          style={{
            justifyContent: "center",
            borderRight: files?.length > 1 ? "1px solid rgb(209 209 209)" : "0",
          }}
        >
          <ImageWithFallback
            media={media}
            width={700}
            height={394}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={media[0].url}
            alt={media[0].name ?? "Not Found"}
            style={{
              // background: media[0].url ? "black" : "rgb(230, 230, 230)",
              objectFit: "contain",
              height: "auto",
            }}
          />
        </div>
      )}
      {media.length > 1 && (
        <div>
          {media[1] && (
            <ImageWithFallback
              media={media}
              width={700}
              height={394}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={media[1].url}
              alt={media[1].name ?? "Not Found"}
              style={{
                objectFit: "contain",
                aspectRatio: media.length < 2 ? "9/10;" : "16/9",
                height: media.length < 3 ? "100%" : "auto",
              }}
            />
          )}
          {media[2] && (
            <div
              style={{
                borderTop: "1px solid rgb(209 209 209)",
                display: "flex",
                position: "relative",
              }}
            >
              <ImageWithFallback
                media={media}
                width={700}
                height={394}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={media[2].url}
                alt={media[2].name ?? "Not Found"}
                style={{ objectFit: "contain", height: "100%" }}
              />
              {files.length - 3 !== 0 && (
                <h2 className={s.backDrop}>+{files.length - 3}</h2>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
