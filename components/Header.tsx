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
import{signout} from '../lib/signout'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../lib/firebase";
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
  const auth = getAuth(app);
  // const user = useUser();
  const [email, setemail] = useState<String | null>(null)
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user.email);
        setemail(user.email)
      } else {
        setemail(null)
        console.log(user);
      }
    });
  }, [email]);
  useEffect(() => {

    const nav = document.getElementsByTagName("nav")[0];
    setwidth(Math.floor(nav.clientWidth / 6));
    if(window.innerWidth < 500){
      console.log(window.innerWidth)
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
      <header style={{display:'flex',justifyContent:'space-between', alignItems:'center'}} className={styles.header}>
        <Logo />
        <button onClick={()=>signout()} style={{cursor:'pointer',border:'2px solid red',color:'red',borderRadius:'10px',width:'100px',height:'50px'}}>{email && email}</button>
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
              width: `${width}px`,
            }}
            className={styles.indicator}
          ></div>
        </div>
      </nav>
    </>
  );
}
