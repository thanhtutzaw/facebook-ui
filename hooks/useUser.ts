import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { app } from "../lib/firebase";
export interface User {
  uid: string;
}
export function useUser() {
  const auth = getAuth(app);
  const [user, setuser] = useState<User | null>(null);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // router.push("/");
        setuser(user);
      } else {
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
