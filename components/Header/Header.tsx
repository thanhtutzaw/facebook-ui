import {
  faBars,
  faBell,
  faHome,
  faSignOut,
  faTv,
  faUser,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signout } from "../../lib/signout";
import styles from "../../styles/Home.module.scss";
import Navitems from "./Navitems";
import { useActive } from "../../hooks/useActive";
import { off } from "process";

// import user from '../hooks/useAuth'
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
  { name: "Friend", icon: <FontAwesomeIcon icon={faUserGroup} /> },
  { name: "Watch", icon: <FontAwesomeIcon icon={faTv} /> },
  { name: "Profile", icon: <FontAwesomeIcon icon={faUser} /> },
  { name: "Noti", icon: <FontAwesomeIcon icon={faBell} /> },
  { name: "Menu", icon: <FontAwesomeIcon icon={faBars} /> },
];
export default function Header(props: any) {
  const { email, indicatorContainerRef } = props;
  // const { user } = useContext(AuthContext);
  // const { navigateTab, active, setActive } = useActive();
  const [width, setwidth] = useState<number>();
  useEffect(() => {
    const nav = document.getElementsByTagName("nav")[0];
    if (email) {
      setwidth(Math.floor(nav.clientWidth / 6));

      if (window.innerWidth < 500) {
        console.log(window.innerWidth);
        // console.log(window.innerWidth);
      }
      window.onresize = () => {
        setwidth(Math.floor(nav.clientWidth / 6));
        console.log("resize");
      };
      window.onbeforeunload = () => {
        // console.log("object");
        setwidth(Math.floor(nav.clientWidth / 6));
      };
    }
    // window.onload =()=>{
    //   setwidth(Math.floor(nav.clientWidth / 6));
    //   console.log("onload")
    // }
  }, [email, width]);

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
        {/* <button
          className={styles.logoutBtn}
          onClick={() => {
            if (active === "/") {
              console.log(active);
              setActive("menu2");
              const target = document.getElementById("menu");
              console.log(target);
              target?.scrollIntoView({ behavior: "smooth" });
              // navigateTab("menu");
            }
          }}
        >
          <FontAwesomeIcon
            style={{ color: "#0070f3", fontWeight: "bold" }}
            icon={faSignOut}
          />
        </button> */}
      </header>

      {email && (
        <nav className={styles.nav}>
          {pages.map((page, index) => (
            <Navitems
              index={index}
              key={page.name}
              name={page.name}
              icon={page.icon}
            />
          ))}
          <div
            ref={indicatorContainerRef}
            className={styles.indicatorContainer}
          >
            <div
              style={{
                width: `${width}px`,
              }}
              className={styles.indicator}
            ></div>
          </div>
        </nav>
      )}
    </>
  );
}
