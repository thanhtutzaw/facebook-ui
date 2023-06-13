/* eslint-disable @next/next/no-img-element */
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import s from "./Post.module.scss";
import { RefObject } from "react";
import { Post } from "../../types/interfaces";
import { deleteStorage } from "../../lib/storage";
export default function PhotoLayout(props: {
  files?: Post["media"] | File[] | any[];
  setFiles?: Function;
  preview?: boolean;
  edit?: boolean;
  uid?: string;
  myPost?: Post;
  dummyRef?: RefObject<HTMLDivElement>;
}) {
  const {
    files,
    setFiles,
    preview = false,
    edit,
    dummyRef,
    uid,
    myPost,
  } = props;
  // const [files, setFiles] = useState();
  if (!preview) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "2rem",
          // scrollPaddingTop: "500px",
        }}
      >
        {files &&
          files.map((file: any, i: number) => (
            <div
              style={{
                backgroundColor: "black",
                display: "flex",
                width: "100%",
                position: "relative",
              }}
              // key={file.id}
              key={i}
            >
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
                // <img src={file.url} />
              )}
              {edit && myPost?.authorId === uid && (
                <button
                  onClick={(e) => {
                    // if (file.url) {
                    // deleteStorage();
                    // } else {
                    e.currentTarget.scrollIntoView();
                    setFiles?.([...files.slice(0, i), ...files.slice(i + 1)]);
                    // alert(i);
                    // setFiles?.(files.filter((_, index) => index !== i));
                    // setFiles?.(files.splice(i, 1));

                    // }

                    // console.log(myPost, file.url);
                    // setFiles?.(files.filter((f: any) => f.id !== file.id));
                    // e.currentTarget?.parentElement?.remove();
                  }}
                  aria-label="delete media"
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
  if (!files) return <></>;
  return (
    <div
      style={{
        // marginBottom: "65px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
        }}
      >
        <div
          className={s.img1}
          style={{
            overflow: "hidden",
            display: "flex",
            minWidth: "50%",
          }}
        >
          {/* {files[0].url} */}
          {/* {JSON.stringify(files[0].url)} */}
          {/* {JSON.stringify(files[0].name)} */}
          <img
            style={{
              maxWidth: "100%",
              margin: "0 auto",
            }}
            src={files[0].url}
            alt={files[0].name}
          />
        </div>
        {/* {files && files[0] && (
       <div
         className={s.img1}
         style={{ display: "flex", minWidth: "50%" }}
       >
         {files[0].type.startsWith("image/") && (
           <img
             style={{ maxWidth: "100%", margin: "0 auto" }}
             // src={URL.createObjectURL(files[0])}
             src={URL.createObjectURL(files[0])}
             alt="Selected"
           />
         )}
       </div>
      )} */}
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
            }}
          >
            <img
              style={{
                maxWidth: "100%",
                margin: "0 auto",
              }}
              src={files[1].url}
              alt={files[1].name}
            />
            {/* {JSON.stringify(files[1].url)} */}
          </div>
          {files[2] && (
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
                src={files[2].url}
                alt={files[2].name}
              />
              {/* {JSON.stringify(files[2].url)} */}
              {myPost && myPost.media.length - 3 !== 0 && (
                <h2
                  style={{
                    pointerEvents: "none",
                    position: "absolute",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "-webkit-fill-available",
                    color: "white",
                    backdropFilter: "brightness(0.8)",
                    margin: "0",
                  }}
                >
                  +{files.length - 3}
                </h2>
              )}
            </div>
          )}
        </div>
        {/* <div>
       {files && files[1] && (
         <div style={{ display: "flex" }}>
           {files[1].type.startsWith("image/") && (
             <img
               style={{ maxWidth: "100%", margin: "0 auto" }}
               // src={URL.createObjectURL(files[1])}
               src={URL.createObjectURL(files[1])}
               alt="Selected"
             />
           )}
         </div>
       )}
       {files && files[2] && (
         <div style={{ display: "flex" }}>
           {files[2].type.startsWith("image/") && (
             <img
               style={{ maxWidth: "100%", margin: "0 auto" }}
               // src={URL.createObjectURL(files[2])}
               src={URL.createObjectURL(files[2])}
               alt="Selected"
             />
           )}
         </div>
       )}
      </div> */}
        {/* {files?.map((file, index) => (
       // <p key={index}>{file.name}</p>
       <div style={{ display: "flex" }} key={index}>
         {file.type.startsWith("image/") && (
           <img
             style={{ maxWidth: "100%", margin: "0 auto" }}
             src={URL.createObjectURL(file)}
             alt="Selected"
           />
         )}
       </div>
      ))} */}
      </div>
      {!files ||
        (files?.length !== 0 && (
          <p
            style={{
              textAlign: "center",
            }}
          >
            Demo Photo Layout !
          </p>
        ))}
    </div>
  );
}
