import styles from "../styles/Home.module.css";
import { AiFillHome } from "react-icons/ai";
import { Navitems } from "./Navitems";
import { Logo } from "./Logo";
import {useContext} from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUserGroup,
  faBars,
  faTv,
  faBell,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { signout } from "../lib/signout";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../lib/firebase";
import AuthContext from "../context/AuthContext";

// import user from '../hooks/useAuth'
export function Header() {
const {user} = useContext(AuthContext);
  // { name: "/", icon: <AiFillHome /> },
  const pages = [
    { name: "/", icon: <FontAwesomeIcon icon={faHome} /> },
    { name: "Friend", icon: <FontAwesomeIcon icon={faUserGroup} /> },
    { name: "Watch", icon: <FontAwesomeIcon icon={faTv} /> },
    { name: "Profile", icon: <FontAwesomeIcon icon={faUser} /> },
    { name: "Noti", icon: <FontAwesomeIcon icon={faBell} /> },
    { name: "Menu", icon: <FontAwesomeIcon icon={faBars} /> },
  ];
  const [width, setwidth] = useState<number>();
  const auth = getAuth(app);
  // const user = useUser();
  const [email, setemail] = useState<String | null>(null);
  useEffect(() => {
    console.log(user?.email)
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // console.log(user.email);
        setemail(user.email);
      } else {
        setemail(null);
        // console.log(user);
      }
    });
  }, [email]);
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
  }, [width, email]);

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
        {email && (
          <button className={styles.logoutBtn} onClick={() => signout()}>
            <span style={{color:'white',   fontWeight: "bold" }}>Logout😡</span>
            {email}
          </button>
        )}
      </header>

      {email && (
        <nav className={styles.nav}>
          {/* <div className={styles.navContainer}> */}
          {pages.map((page, index) => (
            <Navitems
              index={index}
              key={page.name}
              name={page.name}
              icon={page.icon}
            />
          ))}
          {/* </div> */}
          <div className={styles.indicatorContainer}>
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
