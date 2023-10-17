import { getAuth, signOut } from "firebase/auth";
import { app } from "./firebase";
import { Messaging, deleteToken } from "firebase/messaging";

const auth = getAuth(app);

export async function signout(messaging: Messaging) {
  try {
    await deleteToken(messaging);
    await signOut(auth);
  } catch (error: any) {
    console.error(error.message);
    alert(error.message);
  }
}
