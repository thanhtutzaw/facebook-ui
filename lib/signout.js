import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { app } from './firebase';

const auth = getAuth(app);

export function signout() {
    signOut(auth).then(() => {
    }).catch((error) => {
        console.error(error.message)
        alert(error.message)
    });
}