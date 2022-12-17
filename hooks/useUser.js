import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { app } from '../lib/firebase'
export function useUser() {
    const auth = getAuth(app);
    const [user, setuser] = useState(null);
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // router.push("/");
                setuser(user)
            } else {
                setuser(null)
                // console.log("no user in index");
                // router.push("/login");
            }
        });
    }, []);
    return {
        user
    }
}