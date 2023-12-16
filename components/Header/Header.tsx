import { useActiveTab } from "@/hooks/useActiveTab";
import {
  faBars,
  faBell,
  faHome,
  faMessage,
  faSignOut,
  faTv,
  faUser,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import Link from "next/link";
import router from "next/router";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AppContext } from "../../context/AppContext";
import { PageContext, PageProps } from "../../context/PageContext";
import s from "../../styles/Home.module.scss";
import { AppProps, Tabs } from "../../types/interfaces";
import Navitems from "./Navitems";
import SelectModal from "./SelectModal";
const Logo = () => {
  return (
    <div className={`snap-center flex flex-1 items-center h-[60px] bg-white`}>
      <Link
        tabIndex={-1}
        scroll={false}
        href="/"
        className="text-primary font-bold [font-size:_clamp(1.6em,2vw,3em)] ml-[.7rem]"
      >
        facebook
      </Link>
    </div>
  );
};
const navLists = [
  { name: "/", icon: <FontAwesomeIcon icon={faHome} /> },
  { name: "Friends", icon: <FontAwesomeIcon icon={faUserGroup} /> },
  { name: "Watch", icon: <FontAwesomeIcon icon={faTv} /> },
  { name: "Profile", icon: <FontAwesomeIcon icon={faUser} /> },
  { name: "Notifications", icon: <FontAwesomeIcon icon={faBell} /> },
  { name: "Menu", icon: <FontAwesomeIcon icon={faBars} /> },
];
function Header(props: { tabIndex: number }) {
  const { tabIndex } = props;
  const { active, setActive } = useActiveTab();
  const navRef = useRef<HTMLElement>(null);

  const [width, setwidth] = useState<number>();

  // navRef.current ? Math.floor(navRef.current?.clientWidth / 6) : 0;

  const { selectMode, setselectMode, headerContainerRef } = useContext(
    AppContext
  ) as AppProps;
  const { indicatorRef, setSelectedId } = useContext(PageContext) as PageProps;
  // useEffect(() => {
  //   if (typeof window === "undefined") return;
  //   // const nav = document.getElementsByTagName("nav")[0];
  //   // if (!clientWidth) return;
  //   // setwidth(Math.floor(clientWidth / 6));
  //   // console.log(clientWidth);
  //   if (navRef.current) {
  //     const navWidth = navRef.current.clientWidth;
  //     setwidth(navWidth);
  //     console.log("Nav width:", navWidth);
  //   }
  //   // window.onresize = () => {
  //   //   setwidth(Math.floor(clientWidth / 6));
  //   // };
  //   // window.onbeforeunload = () => {
  //   //   setwidth(Math.floor(clientWidth / 6));
  //   // };
  // }, []);
  // useEffect(() => {
  //   // const handleWindowLoad = () => {
  //   if (navRef.current) {
  //     const navWidth = navRef.current.clientWidth;
  //     setwidth(navWidth);
  //     console.log("Nav width:", navWidth);
  //   }
  //   // };

  //   // window.addEventListener("load", handleWindowLoad);

  //   // return () => {
  //   //   window.removeEventListener("load", handleWindowLoad);
  //   // };
  // }, []); // Empty dependency array ensures this runs after the initial render
  useEffect(() => {
    window.onpopstate = () => {
      if (window.location.hash === "#profile") {
        if (selectMode) {
          setselectMode?.(false);
          setSelectedId?.([]);
        }
      }
    };
  }, [selectMode, setSelectedId, setselectMode]);
  const [currentNav, setCurrentNav] = useState<Tabs>("/");

  const headerContainerRef1 = headerContainerRef;
  useEffect(() => {
    const tabs = document.getElementById("tabs");
    const main = document.getElementsByTagName("main")[0];
    const headerContainer = headerContainerRef1?.current;
    if (!headerContainer) return;
    const showHeader = () => {
      headerContainer.setAttribute("data-hide", "false");
      // headerContainer.style.transform = "translateY(0px)";
      // headerContainer.style.height = "120px";
    };
    const hideHeader = () => {
      headerContainer.setAttribute("data-hide", "true");
      // headerContainer.style.transform = "translateY(-60px)";
      // headerContainer.style.height = "60px";
    };
    // if (window.location.hash === "" || window.location.hash === "#home") {
    //   // tabs?.scrollTo({
    //   //   left: 0,
    //   //   behavior: "smooth",
    //   // });`
    // }
    window.onhashchange = (e) => {
      setCurrentNav(active);
      if (window.location.hash === "" || window.location.hash === "#home") {
        showHeader();
        tabs?.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        main.style.scrollSnapType = "none";
        hideHeader();
      }
    };
  }, [active, headerContainerRef1]);
  const handleResize = useCallback(() => {
    if (!navRef.current) return;
    setwidth(navRef.current.clientWidth);
  }, [navRef]);
  useLayoutEffect(() => {
    handleResize();
  }, [handleResize]);
  useEffect(() => {
    window.addEventListener("load", handleResize);
    window.addEventListener("resize", handleResize);
    window.onbeforeunload = () => handleResize();
    return () => {
      window.removeEventListener("load", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, [navRef, handleResize]);
  return (
    <div
      data-hide="false"
      ref={headerContainerRef}
      className={`${s.headerContainer} [transition:transform_0.18s_ease,height_0.15s_ease] [will-change:transform,height] translate-y-0 sticky top-[-60px] z-[200]`}
    >
      <header className={`flex justify-between items-center ${s.header}`}>
        <Logo />
        <div className={s.action}>
          <button
            tabIndex={tabIndex}
            onClick={() => router.push("/chat")}
            title="Go to Messages"
            aria-label="Go to Messages"
          >
            <FontAwesomeIcon
              style={{ color: "#0070f3", fontWeight: "bold" }}
              icon={faMessage}
            />
          </button>
          <button
            tabIndex={tabIndex}
            title="Go to logout button"
            aria-label="go to logout button"
            onClick={() => {
              window.location.hash = "#menu";
              setCurrentNav("menu");
              setActive("menu");
            }}
          >
            <FontAwesomeIcon
              style={{ color: "#0070f3", fontWeight: "bold" }}
              icon={faSignOut}
            />
          </button>
        </div>
      </header>
      <nav ref={navRef} className={s.nav}>
        {!selectMode && (
          <motion.div
            initial={{ width: "100%", opacity: 1 }}
            animate={{
              width: selectMode ? "60%" : "100%",
              opacity: selectMode ? 0 : 1,
            }}
            transition={{ duration: 0.2 }}
            exit={{ opacity: 0, width: "60%" }}
            className={s.navItemsContainer}
          >
            {navLists.map((navList, index) => (
              <Navitems
                // headerContainerRef={headerContainerRef}
                width={width}
                currentNav={currentNav}
                setCurrentNav={setCurrentNav}
                key={navList.name}
                setActive={setActive}
                active={active}
                index={index}
                name={navList.name}
                icon={navList.icon}
              />
            ))}
          </motion.div>
        )}
        {selectMode && (
          <motion.div
            initial={{ width: "70%", opacity: 0 }}
            transition={{ duration: 0.2 }}
            animate={{
              width: !selectMode ? "70%" : "100%",
              opacity: selectMode ? 1 : 0,
            }}
            exit={{ opacity: 0, width: "70%" }}
            className="selectModal"
          >
            <SelectModal />
          </motion.div>
        )}
        <div
          style={{ opacity: selectMode ? 0 : 1 }}
          className={s.indicatorContainer}
        >
          <div
            ref={indicatorRef}
            // style={{
            //   width: `${
            //     width ?? typeof window !== "undefined"
            //       ? Math.floor(
            //           window.document?.getElementsByTagName("nav")[0]
            //             .clientWidth / 6
            //         )
            //       : width
            //   }px`,
            // }}
            style={{
              width: `${(width ?? 0) / 6}px`,
            }}
            // style={{
            //   width: `${
            //     width ??
            //     (navRef.current && Math.floor(navRef.current.clientWidth / 6))
            //   }px`,
            // }}
            className={s.indicator}
          ></div>
        </div>
      </nav>
    </div>
  );
}
export default memo(Header);
