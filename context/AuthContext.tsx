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
  }, [auth, user]);
  return (
    <AuthContext.Provider
      value={{ uid, allUsers, posts, email, myPost, indicatorRef }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
