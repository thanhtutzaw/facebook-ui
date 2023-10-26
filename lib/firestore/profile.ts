import { User, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { account } from "../../types/interfaces";
import { db, getCollectionPath, storage } from "../firebase";
export function getFullName(profile: account["profile"] | undefined | null): string {
  if (!profile) return "Unknown User";
  const { firstName: first, lastName: last } = profile;
  if (first && !last) {
    return `${first}`;
  } else if (!first && last) {
    return `${last}`;
  }
  const fullName = first || last ? `${first} ${last}` : "Unknown User";
  return fullName;
}
export async function addProfile(user: User, profile: account["profile"]) {
  const Ref = doc(db, getCollectionPath.users({ uid: user.uid }));
  const { firstName, lastName } = profile;
  const data = {
    profile: {
      ...profile,
      bio: "",
    },
  };
  console.log({ data });
  try {
    await setDoc(Ref, data);
    await updateName(user, firstName, lastName);
  } catch (error) {
    console.error(error);
  }
}
export async function changeProfile(
  user: User,
  NewProfile: account["profile"],
  originalProfile: account["profile"]
) {
  const Ref = doc(db, getCollectionPath.users({ uid: user.uid }));
  const { firstName, lastName, bio, photoURL } = NewProfile;
  try {
    if (bio !== originalProfile?.bio ?? "") {
      try {
        await setDoc(Ref, {
          profile: {
            ...NewProfile,
            bio: bio ?? "",
            firstName: firstName ?? "",
            lastName: lastName ?? "",
          },
        });
        console.log(" bio Updated ");
      } catch (error) {
        console.log(error);
      }
    }
    // get photo url from cloud storage HERE
    const profileImageFile = photoURL as File;
    const { type, size, name } = profileImageFile;
    if (
      type === "image/jpeg" ||
      type === "image/jpg" ||
      type === "image/png" ||
      type === "image/gif"
    ) {
      if (size > 200 * 1024 * 1024) {
        alert(`File '${name}' size exceeds the allowed limit of 200 MB`);
        return;
      }
      const uploadedUrl = await uploadProfilePicture(profileImageFile);
      const width = 256,
        height = 256;

      if (uploadedUrl !== originalProfile?.photoURL ?? "") {
        try {
          await setDoc(Ref, {
            profile: {
              ...NewProfile,
              bio: bio ?? "",
              firstName: firstName ?? "",
              lastName: lastName ?? "",
              photoURL: uploadedUrl ?? "",
            },
          });
          if (uploadedUrl) {
            const cropResponse = await fetch(
              `/api/crop_image?imageUrl=${encodeURIComponent(
                uploadedUrl
              )}&width=${width}&height=${height}`
            );
            console.log(`cropped_image : ${cropResponse}`);
            await uploadCroppedImage(
              cropResponse,
              name,
              width,
              height,
              type,
              uploadedUrl
            );
          }
          await updateProfilePicture(user, uploadedUrl ?? "");
          console.log(" profile picture Updated ");
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      if (type) {
        alert(
          `${type} is Invalid Type .\nJPEG , PNG , GIF and MP4 are only Allowed !`
        );
      }
    }
    // const url = photoURL as string;

    if (
      (originalProfile?.firstName ?? "") === firstName &&
      (originalProfile?.lastName ?? "") === lastName
    )
      return;
    await setDoc(Ref, {
      profile: {
        ...NewProfile,
        firstName: firstName ?? "",
        lastName: lastName ?? "",
      },
    });
    await updateName(user, firstName ?? "", lastName ?? "");
    console.log("Names Updated");
  } catch (error) {
    console.error(error);
  }

  async function uploadCroppedImage(
    cropResponse: Response,
    name: string,
    width: number,
    height: number,
    type: string,
    uploadedUrl: string
  ) {
    const croppedBlob = await cropResponse.arrayBuffer();
    // const croppedArrayBuffer = new Blob([await cropResponse.arrayBuffer()]);
    console.log(croppedBlob);
    const storageRef = ref(storage);
    // const [baseName, extension] = name.split(".");
    const lastDotIndex = name.lastIndexOf(".");
    const baseName = name.slice(0, lastDotIndex);
    const extension = name.slice(lastDotIndex + 1);
    const modifiedName = `${baseName}_width${width}_height${height}.${extension}`;
    const cropRef = ref(storageRef, `profilePictures/${modifiedName}`);
    if (cropResponse.status === 200) {
      const contentType = cropResponse.headers.get("Content-Type");
      console.log("Content-Type:", contentType);
      const data = await uploadBytes(cropRef, croppedBlob, {
        contentType: type ?? contentType ?? "application/octet-stream",
      });
      const uploadedUrlCropped = await getDownloadURL(cropRef);
      console.log(uploadedUrlCropped);
      await setDoc(Ref, {
        profile: {
          ...NewProfile,
          bio: bio ?? "",
          firstName: firstName ?? "",
          lastName: lastName ?? "",
          photoURL: uploadedUrl ?? "",
          photoURL_cropped: uploadedUrlCropped ?? "",
        },
      });
    }
  }
}
async function uploadProfilePicture(file: File) {
  const storageRef = ref(storage);
  const fileRef = ref(storageRef, `profilePictures/${file.name}`);
  try {
    console.log({ file });
    const snapshot = await uploadBytes(fileRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.log(error);
  }
}
async function updateProfilePicture(user: User, photoURL: string) {
  await updateProfile(user, { photoURL });
}
async function updateName(user: User, firstName: string, lastName: string) {
  await updateProfile(user, {
    displayName: `${firstName} ${lastName}`,
  });
}
export function checkPhotoURL(
  url?: string | null | account["profile"]["photoURL"]
) {
  if (url === "undefined" || !url) {
    return photoURLFallback;
  }
  return url.toString();
}
export const photoURLFallback: string =
  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
