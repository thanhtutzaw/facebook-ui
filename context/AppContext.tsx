import { getAuth, onIdTokenChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { app } from "../lib/firebase";
import { User } from "firebase/auth";
import nookies from "nookies";

import { createContext } from "react";
import { Props } from "../types/interfaces";
// const AppContext = createContext<{ user: User | null }>({ user: null });
export const AppContext = createContext<Props | null>(null);

export function AppProvider(props: Props) {
  const { uid, allUsers, posts, email, myPost } = props;

  // const auth = getAuth(app);
  // const [user, setuser] = useState<User | null>(null);
  // useEffect(() => {
  //   onIdTokenChanged(auth, async (user) => {
  //     // set token in cookie with nookies
  //     if (!user) {
  //       nookies.destroy(undefined, "token");
  //       setuser(null);
  //       return;
  //     }
  //     const token = await user.getIdToken();
  //     if (token) {
  //       setuser(user);
  //       nookies.set(undefined, "token", token, {
  //         maxAge: 30 * 24 * 60 * 60,
  //         path: "/",
  //         secure: true,
  //         // httpOnly: true,
  //       });
  //     }
  //   });
  // }, [auth, user]);
  return (
    <AppContext.Provider value={{ uid, allUsers, posts, email, myPost }}>
      {props.children}
    </AppContext.Provider>
  );
}
