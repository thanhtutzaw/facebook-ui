import { useState } from "react";
import { createContext } from "react";
import { useActive } from "../hooks/useActiveTab";
import { Props } from "../types/interfaces";
// const AppContext = createContext<{ user: User | null }>({ user: null });
export const AppContext = createContext<Props | null>(null);

export function AppProvider(props: Props) {
  const { uid, allUsers, posts, email, myPost } = props;
  const { active, setActive } = useActive();
  const [preventClick, setpreventClick] = useState(false);
  const [showAction, setshowAction] = useState("");

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
    <AppContext.Provider
      value={{
        showAction,
        setshowAction,
        active,
        setActive,
        uid,
        allUsers,
        posts,
        email,
        myPost,
        preventClick,
        setpreventClick,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
