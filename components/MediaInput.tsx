import { RefObject } from "react";
import { setTimeout } from "timers";

export default function MediaInput(props: {
  setFileLoading?: Function;
  setFiles: Function;
  files: File[];
  fileRef: RefObject<HTMLInputElement>;
}) {
  const { setFileLoading, setFiles, files, fileRef } = props;
  return (
    <input
      multiple
      accept="image/*,video/mp4"
      onChange={(e) => {
        const fileArray = Array.from(e.target.files ?? []);
        let valid = true;
        fileArray.map((file) => {
          const fileType = file.type;

          if (
            fileType === "image/jpeg" ||
            fileType === "image/jpg" ||
            fileType === "image/png" ||
            fileType === "image/gif" ||
            fileType === "video/mp4"
          ) {
            console.log(
              `File '${file.name}' is an image (JPEG, PNG, or GIF) or an MP4 video`
            );
            if (file.size > 200 * 1024 * 1024) {
              // Check if file size exceeds 200 MB
              alert(
                `File '${file.name}' size exceeds the allowed limit of 200 MB`
              );
              valid = false;
            }
          } else {
            alert(
              `File '${file.name}' is not one of the specified formats.\nJPEG , PNG , GIF and MP4 are only Allowed !`
            );
            valid = false;
          }
        });
        setFileLoading?.(true);

        if (valid) {
          setFiles([...files, ...fileArray]);
          setTimeout(() => {
            setFileLoading?.(false);
          }, 500);
        }
        console.log(files);
      }}
      ref={fileRef}
      style={{
        display: "none",
        visibility: "hidden",
      }}
      type="file"
    />
  );
}
