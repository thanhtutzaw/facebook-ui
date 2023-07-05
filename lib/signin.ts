import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "./firebase";
import { FirebaseError } from "firebase/app";
const auth = getAuth(app);
export async function signin(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    return null;
  } catch (error: any) {
    // const errorMessage = error.message;
    console.error({ error });
    return error;
  }
}
