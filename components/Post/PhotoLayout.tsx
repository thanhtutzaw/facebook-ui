/* eslint-disable @next/next/no-img-element */
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import s from "./Post.module.scss";
import { RefObject } from "react";
import { Post } from "../../types/interfaces";
import { deleteStorage } from "../../lib/storage";
export default function PhotoLayout(props: {
  files: Post["media"] | File[];
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
      <div className={s.media}>
        {files &&
          files.map((file: any, i: number) => (
            <div
              // key={file.id}
              key={i}
              id={i.toString()}
            >
              {file.type === "video/mp4" ? (
                <video controls src={URL.createObjectURL(file)} />
              ) : (
                <img
                  alt={file.name}
                  src={
                    !file.url ? URL.createObjectURL(file) : file.url
                    // URL.createObjectURL(file)
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
        // marginBottom: "65px",
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
            {/* {files[0].url} */}
            {/* {JSON.stringify(files[0].url)} */}
            {/* {JSON.stringify(files[0].name)} */}
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
            <div
              style={{
                display: "flex",
                // aspectRatio: files.length <= 2 ? "initial" : "9/10",
              }}
            >
              <img
                style={{
                  maxWidth: "100%",
                  margin: "0 auto",
                }}
                src={media[1].url}
                alt={media[1].name}
              />
              {/* {JSON.stringify(files[1].url)} */}
            </div>
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
              {/* {JSON.stringify(files[2].url)} */}
              {files.length - 3 !== 0 && (
                <h2 className={s.backDrop}>+{files.length - 3}</h2>
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
      {/* {!files ||
        (files?.length !== 0 && (
          <p
            style={{
              textAlign: "center",
            }}
          >
            Demo Photo Layout !
          </p>
        ))} */}
    </div>
  );
}
