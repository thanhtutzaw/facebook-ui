import { getAuth, onIdTokenChanged } from "firebase/auth";
import nookies from "nookies";
import { createContext, useEffect } from "react";
import { app } from "../lib/firebase";
import { Props } from "../types/interfaces";

export const AuthContext = createContext<Props | null>(null);

export function AuthProvider(props: Props) {
  const { uid, allUsers, posts, email, myPost } = props;
  // const [user, setuser] = useState<User | null>(null);
  const auth = getAuth(app);
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        nookies.destroy(undefined, "token");
        return;
      }
      try {
        const token = await user.getIdToken();
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
  return (
    <AuthContext.Provider value={{ uid, allUsers, posts, email, myPost }}>
      {props.children}
    </AuthContext.Provider>
  );
}
