import { getAuth, onIdTokenChanged } from "firebase/auth";
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
    onIdTokenChanged(auth, async (user) => {
      console.log("is this running");
      if (!user) {
        nookies.destroy(undefined, "token");
        setuser(null);
        return;
      }
      const token = await user?.getIdToken();
      if (token) {
        setuser(user);
        window.location.href = "/#home";
        alert("should not run")
        nookies.set(undefined, "token", token, {});
      }
    });
    // onAuthStateChanged(auth, async (user) => {
    //   if (user) {
    //     setuser(user);
    //   } else {
    //     setuser(null);
    //   }

    // });
  }, [auth, user]);
  return {
    user,
  };
}
