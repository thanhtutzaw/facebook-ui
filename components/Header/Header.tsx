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
  const { selectMode } = useContext(AppContext) as Props;

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
  const { active } = useActive();
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

      <>
        <nav style={{ margin: "0 auto" }} className={styles.nav}>
          {/* <AnimatePresence> */}
          <SelectModal />
          {/* </AnimatePresence> */}

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
    </>
  );
}
