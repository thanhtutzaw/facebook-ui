import { User, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { account } from "../types/interfaces";
import { db } from "./firebase";

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
  const Ref = doc(db, `users/${user.uid}`);
  const { firstName, lastName, bio } = NewProfile;
  try {
    if (bio !== originalProfile?.bio ?? "") {
      console.log({ ...NewProfile });
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
