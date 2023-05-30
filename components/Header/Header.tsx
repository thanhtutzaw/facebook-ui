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
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useActive } from "../../hooks/useActiveTab";
import styles from "../../styles/Home.module.scss";
import { Props } from "../../types/interfaces";
import Navitems from "./Navitems";
import SelectModal from "./SelectModal";
import { AnimatePresence, motion } from "framer-motion";
import style from "styled-jsx/style";
const Logo = () => {
  return (
    <div className={styles.logoContainer}>
      <Link href="/" className={styles.logo}>
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
export default function Header(props: any) {
  const { indicatorRef } = props;
  const { setActive } = useActive();
  const [width, setwidth] = useState<number>();
  const { selectMode, setselectMode } = useContext(AppContext) as Props;

  useEffect(() => {
    const nav = document.getElementsByTagName("nav")[0];
    setwidth(Math.floor(nav.clientWidth / 6));
    window.onresize = () => {
      setwidth(Math.floor(nav.clientWidth / 6));
      console.log("resize");
    };
    window.onbeforeunload = () => {
      setwidth(Math.floor(nav.clientWidth / 6));
    };
  }, [width]);
  useEffect(() => {
    window.onpopstate = () => {
      history.pushState(null, document.title, location.hash);
      if (!selectMode) return;
      setselectMode?.(false);
    };
  }, [selectMode, setselectMode]);

  return (
    <>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        className={styles.header}
      >
        <Logo />
        <div className={styles.action}>
          <button className={styles.logoutBtn}>
            <FontAwesomeIcon
              style={{ color: "#0070f3", fontWeight: "bold" }}
              icon={faMessage}
            />
          </button>
          <button
            title="Go to logout button"
            aria-label="go to logout button"
            className={styles.logoutBtn}
            onClick={() => {
              setActive("menu");
              const tabs = document.getElementById("tabs");
              tabs?.scrollTo({
                left: 5 * tabs.clientWidth,
              });
            }}
          >
            <FontAwesomeIcon
              style={{ color: "#0070f3", fontWeight: "bold" }}
              icon={faSignOut}
            />
          </button>
        </div>
      </header>

      <nav className={styles.nav}>
        <AnimatePresence mode="wait">
          {selectMode ? (
            <motion.div
              key="selectModal"
              initial={{ width: "70%", opacity: 0 }}
              // initial={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              animate={{
                // width: !selectMode ? "90%" : "100%",
                width: !selectMode ? "70%" : "100%",
                opacity: selectMode ? 1 : 0,
              }}
              exit={{ opacity: 0, width: "70%" }}
              className="selectModal"
              style={{ willChange: "width , opacity " }}
              // style={{ width: "400px" }}
            >
              <SelectModal />
            </motion.div>
          ) : (
            <motion.div
              // key="navItems"
              initial={{ width: "100%", opacity: 1 }}
              animate={{
                width: selectMode ? "60%" : "100%",
                opacity: selectMode ? 0 : 1,
              }}
              transition={{ duration: 0.2 }}
              exit={{ opacity: 0, width: "60%" }}
              style={{
                willChange: "width , opacity ",
                opacity: selectMode ? "0" : "1",
                display: "flex",
                width: "100%",
                height: "100%",
              }}
            >
              {pages.map((page, index) => (
                <Navitems
                  key={page.name}
                  index={index}
                  name={page.name}
                  icon={page.icon}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div
          style={{ opacity: selectMode ? 0 : 1 }}
          className={styles.indicatorContainer}
        >
          <div
            ref={indicatorRef}
            style={{
              width: `${width}px`,
            }}
            className={styles.indicator}
          ></div>
        </div>
      </nav>
    </>
  );
}
