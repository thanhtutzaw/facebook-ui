/* eslint-disable @next/next/no-img-element */
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RefObject, useContext, useEffect, useRef, useState } from "react";
import { Post } from "../../types/interfaces";
import s from "./Post.module.scss";
import { ViewModal } from "./ViewModal";

import { PageContext, PageProps } from "../../context/PageContext";
import Image from "next/image";

export default function PhotoLayout(props: {
  margin?: boolean;
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
    margin,
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
  const [view, setview] = useState({ src: "", name: "" });
  const { viewRef } = useContext(PageContext) as PageProps;

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
                  // window.location.href = `${i.toString()}`;
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
                  // <img
                  //   onError={(e) => {
                  //     const img = e.currentTarget;
                  //     img.src = placeholder;
                  //     img.alt = "Not Found !";
                  //     img.style.filter = "invert(1)";
                  //     img.style.minHeight = "394px";
                  //   }}
                  //   alt={file.name}
                  //   src={
                  //     !file.url ? URL.createObjectURL(file) : file.url
                  //     // Array.isArray(files) &&
                  //     // files.every((file) => file instanceof File)
                  //     //   ? URL.createObjectURL(file)
                  //     //   : file.url
                  //   }
                  // />
                  <Image
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    width={700}
                    height={394}
                    priority
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
        {/* {view.src !== "" && <ViewModal view={view} />} */}
      </>
    );
  }
  const media = files as Post["media"];

  if (!files || !media) return <></>;
  const m1 = media[0];
  // const aspectRatio = myPost?.media?.length! <= 2 ? "initial" : "9/10";
  return (
    <div className={s.preview} style={{ objectFit: "contain" }}>
      {media[0] && (
        <div
          style={{
            // minHeight: files?.length !== 1 ? "initial" : "394px",
            // aspectRatio: myPost?.media?.length === 1 ? "initial" : "9/10",
            // aspectRatio: "initial",
            // aspectRatio: media[1] ? "initial" : "9/10",
            justifyContent: "center",
            // aspectRatio: "9/10",
            // aspectRatio: "initial",
            // position: "relative",
            borderRight: files?.length > 1 ? "1px solid rgb(209 209 209)" : "0",
          }}
        >
          <Image
            priority
            // onError={(e) => {
            //   const img = e.currentTarget;
            //   img.src = placeholder;
            //   img.alt = "Not Found !";
            //   img.style.filter = "invert(1)";
            //   img.style.minHeight = media.length === 2 ? "196px" : "394px";
            // }}
            width={700}
            height={394}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={media[0].url}
            alt={media[0].name}
            style={{ objectFit: "contain", height: "auto" }}
          />
          {/* <img
            // onError={(e) => {
            //   const img = e.currentTarget;
            //   img.src = placeholder;
            //   img.alt = "Not Found !";
            //   img.style.filter = "invert(1)";
            //   img.style.minHeight = media.length === 2 ? "196px" : "394px";
            // }}
            src={media[0].url}
            alt={media[0].name}
            style={{ objectFit: "contain" }}
          /> */}
        </div>
      )}
      {media.length > 1 && (
        <div>
          {media[1] && (
            <Image
              priority
              // onError={(e) => {
              //   const img = e.currentTarget;
              //   img.src = placeholder;
              //   img.alt = "Not Found !";
              //   img.style.filter = "invert(1)";
              //   img.style.minHeight = media.length === 2 ? "196px" : "394px";
              // }}
              width={700}
              height={394}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={media[1].url}
              alt={media[1].name}
              style={{ objectFit: "contain", height: "auto", width: "auto" }}
            />
            // <img
            //   // onError={(e) => {
            //   //   const img = e.currentTarget;
            //   //   img.src = placeholder;
            //   //   img.alt = "Not Found !";
            //   //   img.style.filter = "invert(1)";
            //   //   img.style.minHeight = "196px";
            //   // }}
            //   src={media[1].url}
            //   alt={media[1].name}
            // />
          )}
          {media[2] && (
            <div
              style={{
                borderTop: "1px solid rgb(209 209 209)",
                display: "flex",
                position: "relative",
              }}
            >
              <Image
                priority
                // onError={(e) => {
                //   const img = e.currentTarget;
                //   img.src = placeholder;
                //   img.alt = "Not Found !";
                //   img.style.filter = "invert(1)";
                //   img.style.minHeight = media.length === 2 ? "196px" : "394px";
                // }}
                // width={700}
                width={700}
                height={394}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                // height={394}
                src={media[2].url}
                alt={media[2].name}
                style={{ objectFit: "contain", height: "100%" }}
              />
              {/* <img
                // onError={(e) => {
                //   const img = e.currentTarget;
                //   img.src = placeholder;
                //   img.alt = "Not Found !";
                //   img.style.filter = "invert(1)";
                //   img.style.minHeight = "196px";
                // }}
                src={media[2].url}
                alt={media[2].name}
              /> */}
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
