import styles from "../styles/Home.module.css";
import { AiFillHome } from "react-icons/ai";
import { AiOutlineGroup } from "react-icons/ai";
import { AiOutlineProfile } from "react-icons/ai";
import { Navitems } from "./Navitems";
import { Logo } from "./Logo";
import { useRouter } from "next/router";
import Link from "next/link";

export function Header() {
  const pages = [
    { name: "/", icon: <AiFillHome /> },
    { name: "Friend", icon: <AiOutlineGroup /> },
    { name: "Profile", icon: <AiOutlineProfile /> },
    { name: "Noti", icon: <AiOutlineProfile /> },
    { name: "Watch", icon: <AiOutlineProfile /> },
    { name: "Menu", icon: <AiOutlineProfile /> },
  ];

  // const router = useRouter()
  // const currentRoute = router.pathname
  // const navName = pages.name
  
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
          // <Link
          //   href={page.name}
          //   className={`${styles.navItems} ${
          //     currentRoute === navName ? styles.active : ""
          //   }`}
          // >
          //   {icon}
          // </Link>
        ))}
      </nav>
    </>
  );
}