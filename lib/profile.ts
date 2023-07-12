import { User, updateProfile } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { account } from "../types/interfaces";

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
  Profile: account["profile"],
  originalProfile: account["profile"]
) {
  const Ref = doc(db, `users/${user.uid}`);
  const { firstName, lastName, bio } = Profile;
  try {
    await updateDoc(Ref, {
      profile: {
        ...Profile,
      },
    });
    if (
      originalProfile.firstName === firstName ||
      originalProfile.lastName === lastName
    )
      return;
    await updateName(user, firstName, lastName!);
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
