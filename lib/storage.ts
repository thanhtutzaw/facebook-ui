import {
  ref,
  deleteObject,
  getDownloadURL,
  uploadBytes,
  StorageReference,
} from "firebase/storage";
import { storage } from "./firebase";
import { RefObject } from "react";
import { Media, Post } from "../types/interfaces";
import { promises } from "dns";

// Create a reference to the file to delete
const storageRef = ref(storage);
export async function uploadMedia(files: File[]) {
  let media: Post["media"] = [];
  // const promises: Promise<{ name: string; url: string } | null>[] = [];
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
        // const uploadPromise: Promise<Media | null> = uploadBytes(fileRef, file)
        //   .then(async (snapshot) => {
        //     const downloadURL = await getDownloadURL(snapshot.ref);
        //     const fileData = {
        //       name: name,
        //       url: downloadURL,
        //     };
        //     // media.push(fileData);
        //     return fileData;
        //   })
        const uploadPromise: Promise<Media | null> = uploadBytes(fileRef, file)
          .then(async (snapshot) => {
            const downloadURL = await getDownloadURL(snapshot.ref);
            const fileData = {
              name: name,
              url: downloadURL,
              type: type,
            };
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
      console.log("Error uploading files:", error);
      return null;
    });
  return media;
}
export async function deleteStorage(deleteFile: Media[]) {
  const Deletepromises: Promise<void>[] = [];
  for (let i = 0; i < deleteFile?.length!; i++) {
    if (!deleteFile) return;
    const file = deleteFile[i];
    const { url, type, name } = file;
    if (url && name) {
      // if (!url) return;
      // console.log(type);
      const fileRef = ref(
        storageRef,
        `${type === "video/mp4" ? "videos" : "images"}/${name}`
      );
      const deletePromise = deleteObject(fileRef)
        .then(() => {
          console.info(
            `%c ${deleteFile?.length} Media deleted successfully ✔️ `,
            "color: green"
          );
        })
        .catch((error) => {
          console.log(error);
          alert("Uh-oh, Deleting Media Failed !");
        });
      Deletepromises.push(deletePromise);
    }
  }
  await Promise.all(Deletepromises);
}
