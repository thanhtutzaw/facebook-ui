import { getAuth, onIdTokenChanged } from "firebase/auth";
import nookies from "nookies";
import { createContext, useEffect } from "react";
import { app } from "../lib/firebase";
import { Props } from "../types/interfaces";

export const AuthContext = createContext<Props | null>(null);

export function AuthProvider(props: Props) {
  const { uid, allUsers, posts, email, myPost} = props;
  // const [user, setuser] = useState<User | null>(null);
  
  return (
    <AuthContext.Provider
      value={{ uid, allUsers, posts, email, myPost }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
