import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from './firebase'
const auth = getAuth(app);
export async function signin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user;
        return null;
    } catch (error) {
        const errorMessage = error.message;
        console.error({ error });
        return error;
    }
}