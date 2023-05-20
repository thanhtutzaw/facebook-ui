import { getAuth, onIdTokenChanged } from "firebase/auth";
import { ReactNode, useEffect, useState } from "react";
import { app } from "../lib/firebase";
import nookies from "nookies";

import { createContext } from "react";
import { User } from "firebase/auth";
import { Props } from "../types/interfaces";
import Post from "../components/Post/Post";
// export const AuthContext = createContext<{ user: User | null }>({ user: null });
export const AuthContext = createContext<Props | null>(null);
// export const AuthContext = createContext<Props>({
//   posts:
//   email: null,
//   myPost?: Post[],
// });

export function AuthProvider(props: Props) {
  const { uid, allUsers, posts, email, myPost, indicatorRef } = props;
  const auth = getAuth(app);
  const [user, setuser] = useState<User | null>(null);
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        // User is not authenticated
        nookies.destroy(undefined, "token");
        setuser(null);
        return;
      }

      try {
        const token = await user.getIdToken();

        // Update the user state
        setuser(user);

        // Store the token in a cookie
        nookies.set(undefined, "token", token, {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
          secure: true,
        });

        // Handle the login process
        // This could be a function that performs any necessary actions after the user logs in
        // handleLogin();
      } catch (error) {
        console.log("Error refreshing ID token:", error);
      }
    });

    return () => {
      // Unsubscribe from the onIdTokenChanged listener when the component unmounts
      unsubscribe();
    };
  }, []); // Empty dependency array ensures the effect runs only once
  return (
    <AuthContext.Provider
      value={{ uid, allUsers, posts, email, myPost, indicatorRef }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
