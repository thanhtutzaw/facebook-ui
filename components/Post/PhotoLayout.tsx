import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useRouter } from "next/router";
import { RefObject, memo } from "react";
import { usePageContext } from "../../context/PageContext";
import { Media, Post } from "../../types/interfaces";
import ImageWithFallback from "../ImageWithFallback";
import s from "./index.module.scss";

function PhotoLayout(props: {
  fileRef?: RefObject<HTMLInputElement>;
  margin?: boolean;
  deleteFile?: Post["media"] | File[];
  form?: {
    files: File[] | Post["media"];
    visibility: string;
  };
  updateForm?: Function;
  setdeleteFile?: Function;
  preview?: boolean;
  edit?: boolean;
  dummyRef?: RefObject<HTMLDivElement>;
  post?: Post;
}) {
  const {
    post,
    deleteFile,
    setdeleteFile,
    form,
    updateForm,
    preview = false,
    edit,
    fileRef,
  } = props;
  const files = form ? form.files : post ? post.media : null;
  const { auth } = usePageContext();

  //   window.onpopstate = () => {
  //     history.pushState(null, document.title, location.hash);
  const router = useRouter();
  if (!preview) {
    return (
      <>
        <div
          className={s.media}
          // style={{ marginBottom: margin ? "65px" : "initial" }}
          style={{ marginBottom: "initial" }}
        >
          {files &&
            files.map((file: Media | File, fileIndex: number) => {
              function isMedia(file: Media | File): file is Media {
                return (file as Media).url !== undefined;
              }
              return (
                <div
                  onClick={() => {
                    if (file.type === "video/mp4") return;
                    router.replace({
                      pathname: router.pathname,
                      query: {
                        ...router.query,
                      },
                    });
                    router.push({
                      query: {
                        ...router.query,
                        viewImage: isMedia(file)
                          ? file.url
                          : URL.createObjectURL(file),
                        imageName: isMedia(file) && file.name,
                      },
                    });
                  }}
                  key={fileIndex}
                  id={fileIndex.toString()}
                >
                  {file.type === "video/mp4" ? (
                    <video
                      controls
                      src={!isMedia(file) ? URL.createObjectURL(file) : ""}
                    />
                  ) : (
                    <Image
                      id={`${isMedia(file) ? `media-${file.name}` : ""}`}
                      priority={false}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      width={700}
                      height={394}
                      alt={file.name}
                      src={
                        isMedia(file) ? file.url : URL.createObjectURL(file)
                        // files.every((file) => file instanceof File)
                        //   ? URL.createObjectURL(file)
                        //   : file.url
                      }
                      onError={(e) => {
                        console.log("Image Error in PhotoLayout");
                      }}
                      style={{ objectFit: "contain", height: "auto" }}
                    />
                  )}
                  {edit && post?.authorId == auth?.currentUser?.uid && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const data = media?.filter(
                          (_, index) => index === fileIndex
                        );
                        setdeleteFile?.([
                          ...(deleteFile ?? []),
                          ...(data ?? []),
                        ]);
                        updateForm?.({
                          files: [
                            ...files.slice(0, fileIndex),
                            ...files.slice(fileIndex + 1),
                          ],
                        });
                        // setFiles(files.splice(i, 1));
                        if (fileRef && fileRef.current) {
                          fileRef.current.value = "";
                        }
                      }}
                      title="Delete Media"
                      aria-label="Delete Media"
                      tabIndex={-1}
                      className={s.deletePhoto}
                    >
                      <FontAwesomeIcon icon={faClose} />
                    </button>
                  )}
                  {router.pathname === "/addPost" && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isMedia(file) && file.url) {
                          const media = files as Post["media"];
                          const data = media?.filter(
                            (_, index) => index === fileIndex
                          );
                          setdeleteFile?.([
                            ...(deleteFile ?? []),
                            ...(data ?? []),
                          ]);
                        }
                        delete files[fileIndex];
                        updateForm?.({
                          files: [
                            ...files.slice(0, fileIndex),
                            ...files.slice(fileIndex + 1),
                          ],
                        });
                        // setFiles(files.filter((_, index) => index !== i));
                        // setFiles(files.splice(i, 1));
                        if (fileRef && fileRef.current) {
                          fileRef.current.value = "";
                        }
                      }}
                      title="Remove media from Form"
                      aria-label="Remove media from Form"
                      tabIndex={-1}
                      className={s.deletePhoto}
                    >
                      <FontAwesomeIcon icon={faClose} />
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </>
    );
  }
  const media = files as Post["media"];

  if (!files || !media) return <></>;
  if (media.length === 0) return <></>;
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
            onClick={(e) => {
              e.stopPropagation();
              router.push({
                pathname: `${String(post?.authorId)}/${String(post?.id)}`,
                hash: `media-${media[0].name ?? ""}`,
              });
            }}
            media={media}
            width={700}
            height={394}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={media[0].url}
            alt={media[0].name ?? "Not Found"}
            style={{
              objectFit: !media[0].url ? "initial" : "cover",
              height: "100%",
            }}
            loading="lazy"
          />
        </div>
      )}
      {media.length > 1 && (
        <div>
          {media[1] && (
            <ImageWithFallback
              onClick={(e) => {
                e.stopPropagation();
                router.push({
                  pathname: `${String(post?.authorId)}/${String(post?.id)}`,
                  hash: `media-${media[1].name ?? ""}`,
                });
              }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  router.push({
                    pathname: `${String(post?.authorId)}/${String(post?.id)}`,
                    hash: `media-${media[2].name ?? ""}`,
                  });
                }}
                media={media}
                width={700}
                height={394}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={media[2].url}
                alt={media[2].name ?? "Not Found"}
                style={{ objectFit: "contain", height: "100%" }}
              />
              {files.length - 3 > 0 && (
                <h2 className={s.backDrop}>+{files.length - 3}</h2>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default memo(PhotoLayout);
