import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from './firebase'
const auth = getAuth(app);
export function signin(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
        })
        .catch((error) => {
            console.error({ error })
        });
}