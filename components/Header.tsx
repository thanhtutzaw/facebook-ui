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
  return (
    <>
      <header className={styles.header}>
        <Logo />
      </header>

      <nav className={styles.nav}>
        {pages.map((page, index) => (
          <Navitems
            index={index}
            key={page.name}
            name={page.name}
            icon={page.icon}
          ></Navitems>
        ))}
      </nav>
    </>
  );
}