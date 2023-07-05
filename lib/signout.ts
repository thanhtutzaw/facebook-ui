import { getAuth, signOut } from "firebase/auth";
import { app } from "./firebase";

const auth = getAuth(app);

export async function signout() {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error(error.message);
    alert(error.message);
  }
}
