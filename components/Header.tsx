import styles from "../styles/Home.module.css";
import { AiFillHome } from "react-icons/ai";
import { Navitems } from "./Navitems";
import { Logo } from "./Logo";
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

export function Header() {
  // { name: "/", icon: <AiFillHome /> },
  const pages = [
    { name: "/", icon: <FontAwesomeIcon icon={faHome} /> },
    { name: "Friend", icon: <FontAwesomeIcon icon={faUserGroup} /> },
    { name: "Watch", icon: <FontAwesomeIcon icon={faTv} /> },
    { name: "Profile", icon: <FontAwesomeIcon icon={faUser} /> },
    { name: "Noti", icon: <FontAwesomeIcon icon={faBell} /> },
    { name: "Menu", icon: <FontAwesomeIcon icon={faBars} /> },
  ];
  const [width, setwidth] = useState<number>()
  useEffect(() => {
    const nav = document.getElementsByTagName("nav")[0];
    if(window.innerWidth < 500){
      console.log(window.innerWidth)
      setwidth(Math.floor(nav.clientWidth / 6));
      // console.log(window.innerWidth);
    }
    window.onresize = ()=>{
      setwidth(Math.floor(nav.clientWidth / 6));
      console.log("resize")
    }
    window.onbeforeunload=()=>{
      // console.log("object");
      setwidth(Math.floor(nav.clientWidth / 6));
    }
    // window.onload =()=>{
    //   setwidth(Math.floor(nav.clientWidth / 6));
    //   console.log("onload")
    // }
      
    
  }, [width])
  
  return (
    <>
      <header className={styles.header}>
        <Logo />
      </header>

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
              // transform: `translateX(${Math.floor(0)}px)`,
              // transform: `translate(${Math.floor(width / 6)}px,0px)`,
              width: width+"px",
              // transform: `translateX(${(width*0)}px)`,
            }}
            className={styles.indicator}
          ></div>
        </div>
      </nav>
    </>
  );
}
