import {
  ref,
  deleteObject,
  getDownloadURL,
  uploadBytes,
  StorageReference,
} from "firebase/storage";
import { storage } from "./firebase";
import { RefObject } from "react";
import { Post } from "../types/interfaces";

// Create a reference to the file to delete
export async function uploadMedia(files: File[]) {
  const storageRef = ref(storage);
  let media: Post["media"] = [];
  const promises: Promise<{ name: string; url: string } | null>[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filename = file.name;
    const fileType = file.type;
    if (
      fileType === "image/jpeg" ||
      fileType === "image/jpg" ||
      fileType === "image/png" ||
      fileType === "image/gif" ||
      fileType === "video/mp4"
    ) {
      const fileRef = ref(
        storageRef,
        fileType !== "video/mp4" ? `images/${filename}` : `videos/${filename}`
      );
      const uploadPromise: Promise<{
        name: string;
        url: string;
      } | null> = uploadBytes(fileRef, file)
        .then(async (snapshot) => {
          const downloadURL = await getDownloadURL(snapshot.ref);
          const fileData = {
            name: filename,
            url: downloadURL,
          };
          // media.push(fileData);
          return fileData;
        })
        .catch((error) => {
          console.log("Error Uploading File:", error);
          return null;
        });
      console.log(uploadPromise);
      // uploadPromises.push(uploadPromise);
      promises.push(uploadPromise);
      // uploadPromises.push(uploadPromise);
    } else {
      alert(
        `${fileType} is Invalid Type .\nJPEG , PNG , GIF and MP4 are only Allowed !`
      );
    }
  }
  await Promise.all(promises)
    .then((uploadedFiles) => {
      media = uploadedFiles.filter((file) => file !== null) as Post["media"];
      //   console.log(media);
    })
    .catch((error) => {
      console.log("Error uploading files:", error);
      return null;
    });
  return media;
}
export function deleteStorage() {
  const desertRef = ref(storage, "images/desert.jpg");

  // Delete the file

  deleteObject(desertRef)
    .then(() => {
      console.log("File deleted successfully");
    })
    .catch((error) => {
      console.log(error);
      alert("Uh-oh, an error occurred!");
    });
}
