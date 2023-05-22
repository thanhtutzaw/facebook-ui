import { User, getAuth, onIdTokenChanged } from "firebase/auth";
import nookies from "nookies";
import { createContext, useEffect, useState, ReactNode } from "react";
import { app } from "../lib/firebase";
import { Props } from "../types/interfaces";
// import { addTokenRenewalListener } from "../lib/firebaseAuth";

// export const AuthContext = createContext(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // const { uid, allUsers, posts, email, myPost } = props;
  const auth = getAuth(app);
  const [user, setuser] = useState<User | null>(null);
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        nookies.destroy(undefined, "token");
        setuser(null);
        return;
      }
      try {
        const token = await user.getIdToken();
        setuser(user);
        // Store the token in a cookie
        nookies.set(undefined, "token", token, {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
          secure: true,
        });
      } catch (error) {
        console.log("Error refreshing ID token:", error);
      }
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // return <AuthContext.Provider>{children}</AuthContext.Provider>;
  return <></>;
}
