import { User, updateProfile } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { account } from "../types/interfaces";
import Profile from "../components/Sections/Profile";

// export async function updateUserName(
//   UserCredential: UserCredential,
//   Account: account
// ) {
//   //   await updateProfile(UserCredential.user, {
//   //     displayName: Account.firstName + Account.lastName,
//   //   });
// }
export async function addProfile(user: User, profile: account["profile"]) {
  const Ref = doc(db, `users/${user.uid}`);
  const { firstName, lastName } = profile;
  // const [firstName] = Account.profile
  try {
    await setDoc(Ref, {
      profile: {
        ...profile,
        bio: "",
      },
    });
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
  console.log(user.uid);
  const Ref = doc(db, `users/${user.uid}`);
  const { firstName, lastName, bio } = NewProfile;
  try {
    if (bio !== originalProfile?.bio ?? "") {
      console.log("updating bio");
      console.log({ ...NewProfile });
      try {
        await setDoc(Ref, {
          profile: {
            ...NewProfile,
            bio: NewProfile?.bio ?? "",
          },
        });
      } catch (error) {
        console.log(error);
      }
      // console.log(firstName == originalProfile?.firstName! ?? "");
    }
    if (
      (originalProfile?.firstName ?? "") === firstName &&
      (originalProfile?.lastName ?? "") === lastName
    )
      return;
    console.log("updating names");
    // console.log("update userName " + firstName ?? "", lastName ?? "");
    await updateName(user, firstName ?? "", lastName ?? "");
  } catch (error) {
    console.error(error);
  }
}

async function updateName(
  user: User,
  // setnewProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  firstName: string,
  lastName: string
) {
  await updateProfile(user, {
    displayName: `${firstName} ${lastName}`,
  });
}
