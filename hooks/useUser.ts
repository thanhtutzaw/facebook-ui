import { getAuth, onAuthStateChanged, onIdTokenChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { app } from "../lib/firebase";
import nookies from "nookies";
export interface User {
  uid: string;
}
export function useUser() {
  const auth = getAuth(app);
  const [user, setuser] = useState<User | null>(null);
  useEffect(() => {
    // onIdTokenChanged(auth, async (user) => {
    //   if (!user) {
    //     nookies.destroy(undefined, "token");
    //   }
    //   const token = await user?.getIdToken();
    //   nookies.set(undefined, "token", token , {});
    // });
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // router.push("/");
        setuser(user);
        const uid = user.uid;
        // localStorage.setItem('uid',uid)
        // console.log(user.uid);
      } else {
        // localStorage.removeItem('uid')
        setuser(null);
        // console.log("no user in index");
        // router.push("/login");
      }
    });
    // console.log(user)
  }, [user]);
  return {
    user,
  };
}
