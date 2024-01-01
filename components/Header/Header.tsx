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
  const { UnReadNotiCount, selectMode, setselectMode, headerContainerRef } =
    useContext(AppContext) as AppProps;
  const { indicatorRef, setSelectedId, friendReqCount } = useContext(
    PageContext
  ) as PageProps;
  const [currentNav, setCurrentNav] = useState<Tabs>("/");
  const [activeNav, setActiveNav] = useState<Tabs>("/");
  // useEffect(() => {
  //   if (window.location.pathname !== "/") return;
  //   // window.location.hash = currentNav === "/" ? "home" : currentNav;
  //   setCurrentNav(window.location.hash.replace("#", "") as Tabs);
  //   setActiveNav(window.location.hash.replace("#", "") as Tabs);
  // }, []);

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

  useEffect(() => {
    const headerContainer = headerContainerRef?.current;
    if (!headerContainer) return;
    setCurrentNav(active);
    // }, [active, headerContainerRef, hide]);
  }, [active, headerContainerRef]);
  useEffect(() => {
    window.onhashchange = () => {
      setActiveNav(active);
    };
  }, [active]);
  const [hide, setHide] = useState(false);
  const showHeader = () => {
    setHide(false);
  };
  const hideHeader = () => {
    setHide(true);
  };
  useEffect(() => {
    const tabs = document.getElementById("tabs");
    const main = document.getElementsByTagName("main")[0];

    // if (currentNav) {
    //   window.location.hash = currentNav === "/" ? "home" : currentNav;
    // }
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
  }, [currentNav]);

  const handleResize = useCallback(() => {
    if (!navRef.current) return;
    setwidth(navRef.current.clientWidth);
  }, [navRef]);
  useEffect(() => {
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
  // const [notiCount, setNotiCount] = useState(UnReadNotiCount);
  const notiCount = UnReadNotiCount;
  const badge: Record<Tabs, null | JSX.Element | false> = {
    home: null,
    "/": null,
    friends: <Navitems.BadgeItem count={friendReqCount} />,
    watch: null,
    profile: null,
    menu: null,
    notifications: active !== "notifications" && (
      <Navitems.BadgeItem count={notiCount} />
    ),
  };
  // useEffect(() => {
  //   setNotiCount(UnReadNotiCount);
  // }, [UnReadNotiCount]);
  return (
    <div
      data-hide={hide}
      ref={headerContainerRef}
      className={`${s.headerContainer} translate-y-0 sticky bottom-0 z-[200]`}
    >
      {/* [transition:transform_0.18s_ease,height_0.15s_ease] [will-change:transform,height] */}
      {/* <header className={`flex justify-between items-center ${s.header}`}> */}
      <header
        className={`flex justify-between items-center [transition:transform_0.18s_ease] [will-change:transform]`}
      >
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
            {navLists.map(({ name, icon }, index) => {
              const iconTitle = name === "/" ? "Home" : name;
              const TabName = name.toLowerCase() as Tabs;
              const title: { [key in Tabs]: string } = {
                home: iconTitle,
                "/": iconTitle,
                friends: iconTitle,
                watch: iconTitle,
                profile: iconTitle,
                menu: iconTitle,
                notifications: `${
                  (notiCount ?? 0) > 0
                    ? `${iconTitle} (${notiCount})`
                    : iconTitle
                }`,
              };
              return (
                <Navitems
                  key={`${name} ${UnReadNotiCount}`}
                  currentNav={activeNav}
                  setCurrentNav={setCurrentNav}
                  setActiveNav={setActiveNav}
                  setActive={setActive}
                  active={active}
                  index={index}
                  name={name}
                >
                  <Navitems.Container
                    aria-label={iconTitle}
                    title={title[TabName]}
                  >
                    <Navitems.Icon>{icon}</Navitems.Icon>
                    <Navitems.Badge>{badge[TabName]}</Navitems.Badge>
                  </Navitems.Container>
                  {currentNav === TabName && !width ? (
                    <Navitems.Indicator />
                  ) : (
                    <></>
                  )}
                </Navitems>
              );
            })}
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
            style={{
              width: `${(width ?? 0) / 6}px`,
            }}
            className={s.indicator}
          ></div>
        </div>
      </nav>
    </div>
  );
}
export default memo(Header);
