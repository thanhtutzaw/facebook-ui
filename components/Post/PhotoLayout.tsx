import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import s from "./Post.module.scss";
import { RefObject } from "react";
function PhotoLayout({
  files = [
    { id: 1, name: "1.gif" },
    { id: 2, name: "2.gif" },
    { id: 3, name: "3.jpg" },
    { id: 4, name: "4.png" },
  ],
  setFiles,
  preview = false,
  edit,
  dummyRef,
}: {
  files?: any;
  setFiles?: Function;
  preview?: boolean;
  edit?: boolean;
  dummyRef?: RefObject<HTMLDivElement>;
}) {
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
        {files.map((file: File, i: number) => (
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
              <img src={URL.createObjectURL(file)} />
            )}
            {edit && (
              <button
                onClick={(e) => {
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
        }}
      >
        {files && files[0] && (
          <div
            className={s.img1}
            style={{
              display: "flex",
              minWidth: "50%",
            }}
          >
            {files[0] && (
              <img
                style={{
                  maxWidth: "100%",
                  margin: "0 auto",
                }} // src={URL.createObjectURL(files[0])}
                src={files[0].name}
                alt="Selected"
              />
            )}
          </div>
        )}
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
        <div>
          {files && files[1] && (
            <div
              style={{
                display: "flex",
              }}
            >
              {files[1] && (
                <img
                  style={{
                    maxWidth: "100%",
                    margin: "0 auto",
                  }} // src={URL.createObjectURL(files[1])}
                  src={files[1].name}
                  alt="Selected"
                />
              )}
            </div>
          )}
          {files && files[2] && (
            <div
              style={{
                display: "flex",
                position: "relative",
              }}
            >
              {files[2] && (
                <img
                  style={{
                    maxWidth: "100%",
                    margin: "0 auto",
                  }} // src={URL.createObjectURL(files[2])}
                  src={files[2].name}
                  alt="Selected"
                />
              )}
              {files.length - 3 !== 0 && (
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

export default PhotoLayout;
