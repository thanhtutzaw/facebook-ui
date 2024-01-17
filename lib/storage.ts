import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { Media, Post } from "../types/interfaces";
import { storage } from "./firebase";

const storageRef = ref(storage);
export async function uploadMedia(files: File[]) {
  let media: Post["media"] = [];
  const promises: Promise<Media | null>[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.lastModified) {
      const { name, type } = file;
      if (
        type === "image/jpeg" ||
        type === "image/jpg" ||
        type === "image/png" ||
        type === "image/gif" ||
        type === "video/mp4"
      ) {
        const fileRef = ref(
          storageRef,
          type !== "video/mp4" ? `images/${name}` : `videos/${name}`
        );
        let fileData = null;
        const uploadPromise: Promise<Media> = uploadBytes(fileRef, file)
          .then(async (snapshot) => {
            fileData = {
              name,
              url: await getDownloadURL(snapshot.ref),
              type,
            };
            return fileData;
          })
          .catch((error) => {
            console.error("Error Uploading File:", error);
            throw new Error(`Error Uploading File: ${error}`);
          });
        // console.log(uploadPromise);
        promises.push(uploadPromise);
      } else {
        alert(
          `${type} is Invalid Type .\nJPEG , PNG , GIF and MP4 are only Allowed !`
        );
        throw new Error(
          `${type} is Invalid Type .\nJPEG , PNG , GIF and MP4 are only Allowed !`
        );
      }
    }
  }
  await Promise.all(promises)
    .then((uploadedFiles) => {
      media = uploadedFiles.filter((file) => file !== null) as Media[];
    })
    .catch((error) => {
      alert(`Error uploading files: ${error}`);
      console.log("Error uploading files:", error);
      return null;
    });
  return media;
}
export async function deleteMedia(deleteFiles: Media[]) {
  // const Deletepromises: Promise<void>[] = [];
  try {
    for (let i = 0; i < deleteFiles?.length!; i++) {
      if (!deleteFiles) return;
      const file = deleteFiles[i];
      const { url, type, name } = file;
      if (url && name) {
        const fileRef = ref(
          storageRef,
          `${type === "video/mp4" ? "videos" : "images"}/${name}`
        );
        await deleteObject(fileRef);
        console.info(
          `%c ${deleteFiles?.length} Media deleted successfully ✔️ `,
          "color: green"
        );

        // Deletepromises.push(deletePromise);
      }
    }
  } catch (error) {
    console.log(error);
    alert("Uh-oh, Deleting Media Failed !");
    throw new Error(`${error}`);
  }

  // await Promise.all(Deletepromises);
}
