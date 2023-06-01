import { useRef, useState, useEffect } from "react";
import { createContext } from "react";
import { useActive } from "../hooks/useActiveTab";
import { Props } from "../types/interfaces";
import { useRouter } from "next/router";
// const AppContext = createContext<{ user: User | null }>({ user: null });
export const AppContext = createContext<Props | null>(null);

export function AppProvider(props: Props) {
  const { uid, allUsers, posts, email, myPost, expired } = props;
  const { active, setActive } = useActive();
  const [preventClick, setpreventClick] = useState(false);
  const [showAction, setshowAction] = useState("");
  const [selectMode, setselectMode] = useState(false);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (expired) {
      router.push("/");
      console.log("expired and pushed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);
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
  useEffect(() => {
    const tabs = document.getElementById("tabs");
    const main = document.getElementsByTagName("main")[0];

    const headerContainer = headerContainerRef?.current;
    if (window.location.hash === "" || window.location.hash === "#home") {
      if (!headerContainer) return;
      console.log(headerContainerRef.current);
      headerContainer.style.transform = "translateY(0px)";
      headerContainer.style.height = "120px";
      main.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      tabs?.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    }
    window.onhashchange = (e) => {
      if (window.location.hash === "" || window.location.hash === "#home") {
        tabs?.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        main.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        main.style.scrollSnapType = "none";
        if (!headerContainer) return;
        headerContainer.style.transform = "translateY(-60px)";
        headerContainer.style.height = "60px";
      }
    };

    console.log(active);
    if (active === "/") window.location.hash = "#home";
  }, [active]);
  return (
    <AppContext.Provider
      value={{
        headerContainerRef,
        selectMode,
        setselectMode,
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
