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
import { useEffect, useState } from "react";
import { useActive } from "../../hooks/useActiveTab";
import styles from "../../styles/Home.module.scss";
import Navitems from "./Navitems";
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
  const { email, indicatorRef } = props;
  // const { user } = useContext(AuthContext);
  const { active, setActive } = useActive();
  const [width, setwidth] = useState<number>();
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
        {email}
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

      {/* {email && ( */}
      <nav className={styles.nav}>
        {pages.map((page, index) => (
          <Navitems
            key={page.name}
            index={index}
            name={page.name}
            icon={page.icon}
          />
        ))}
        <div className={styles.indicatorContainer}>
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
