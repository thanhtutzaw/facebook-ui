import { getAuth, onIdTokenChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { app } from "../lib/firebase";
import { User } from "firebase/auth";
import nookies from "nookies";

import AuthContext from "./AuthContext";

export function AuthProvider({ children }: any) {
  const auth = getAuth(app);
  const [user, setuser] = useState<User | null>(null);
  useEffect(() => {
    onIdTokenChanged(auth, async (user) => {
      // set token in cookie with nookies
      if (!user) {
        nookies.destroy(undefined, "token");
        setuser(null);
        return;
      }
      const token = await user.getIdToken();
      if (token) {
        setuser(user);
        nookies.set(undefined, "token", token, {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
          secure: true,
          // httpOnly: true,
        });
      }
    });
    // onAuthStateChanged(auth, async (user) => {
    //   if (user) {
    //     setuser(user);
    //     const uid = user.uid;
    //   } else {
    //     setuser(null);
    //   }

    // });
  }, [auth, user]);
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}
