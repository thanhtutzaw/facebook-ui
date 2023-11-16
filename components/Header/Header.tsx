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
import { memo, useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { PageContext, PageProps } from "../../context/PageContext";
import { useActive } from "../../hooks/useActiveTab";
import s from "../../styles/Home.module.scss";
import { AppProps } from "../../types/interfaces";
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
export const pages = [
  { name: "/", icon: <FontAwesomeIcon icon={faHome} /> },
  { name: "Friends", icon: <FontAwesomeIcon icon={faUserGroup} /> },
  { name: "Watch", icon: <FontAwesomeIcon icon={faTv} /> },
  { name: "Profile", icon: <FontAwesomeIcon icon={faUser} /> },
  { name: "Notifications", icon: <FontAwesomeIcon icon={faBell} /> },
  { name: "Menu", icon: <FontAwesomeIcon icon={faBars} /> },
];
function Header(props: { tabIndex: number }) {
  const { tabIndex } = props;
  const { active, setActive } = useActive();
  const [width, setwidth] = useState<number>();
  const { selectMode, setselectMode, headerContainerRef } = useContext(
    AppContext
  ) as AppProps;
  const { indicatorRef, setSelectedId } = useContext(PageContext) as PageProps;

  useEffect(() => {
    const nav = document.getElementsByTagName("nav")[0];
    setwidth(Math.floor(nav.clientWidth / 6));
    window.onresize = () => {
      setwidth(Math.floor(nav.clientWidth / 6));
    };
    window.onbeforeunload = () => {
      setwidth(Math.floor(nav.clientWidth / 6));
    };
  }, [width]);
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
  const headerContainer = headerContainerRef?.current;

  useEffect(() => {
    const tabs = document.getElementById("tabs");
    const main = document.getElementsByTagName("main")[0];

    if (window.location.hash === "" || window.location.hash === "#home") {
      if (!headerContainer) return;
      headerContainer.style.transform = "translateY(0px)";
      headerContainer.style.height = "120px";
      // main.scrollTo({
      //   top: 0,
      //   behavior: "smooth",
      // });
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
        main.style.scrollSnapType = "none";
        if (!headerContainer) return;
        headerContainer.style.transform = "translateY(-60px)";
        headerContainer.style.height = "60px";
      }
    };
  }, [headerContainer, active]);
  return (
    <div
      ref={headerContainerRef}
      className={`[transition:transform_0.18s_ease,height_0.15s_ease] [will-change:transform,height] translate-y-0 sticky top-[-60px] z-[200]`}
    >
      {/* <button
        onClick={() => {
          setheaderHide?.(true);
        }}
      >
        hide
      </button>
      {headerHide ? "true" : "false"} */}
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
              window.location.href = "#menu";
              // const tabs = document.getElementById("menu");
              // tabs?.scrollTo({
              //   left: 5 * tabs.clientWidth,
              // });
            }}
          >
            <FontAwesomeIcon
              style={{ color: "#0070f3", fontWeight: "bold" }}
              icon={faSignOut}
            />
          </button>
        </div>
      </header>

      <nav className={s.nav}>
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
            {pages.map((page, index) => (
              <Navitems
                key={page.name}
                setActive={setActive}
                active={active}
                index={index}
                name={page.name}
                icon={page.icon}
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
            // style={{

            // }}
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
              width: `${width}px`,
            }}
            className={s.indicator}
          ></div>
        </div>
      </nav>
    </div>
  );
}
export default memo(Header);
