import { getAuth, signOut } from "firebase/auth";
import { Router, useRouter } from "next/router";
import { app } from './firebase'

const auth = getAuth(app);

export function signout() {
    signOut(auth).then(() => {
        // Sign-out successful.
        const router = useRouter()
        router.push('/login')
    }).catch((error) => {
        // An error happened.
    });
}