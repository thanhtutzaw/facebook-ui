import { User, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { account } from "../../types/interfaces";
import { db, storage } from "../firebase";
export async function addProfile(user: User, profile: account["profile"]) {
  const Ref = doc(db, `users/${user.uid}`);
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
  const Ref = doc(db, `users/${user.uid}`);
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
          await updateProfilePicture(user, uploadedUrl ?? "");
          console.log(" profile picture Updated ");
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      alert(
        `${type} is Invalid Type .\nJPEG , PNG , GIF and MP4 are only Allowed !`
      );
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
}
async function uploadProfilePicture(file: File) {
  const storageRef = ref(storage);
  const fileRef = ref(storageRef, `profilePictures/${file.name}`);
  try {
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
