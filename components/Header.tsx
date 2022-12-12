import styles from "../styles/Home.module.css";
import { AiFillHome } from "react-icons/ai";
import { AiOutlineGroup } from "react-icons/ai";
import { AiOutlineProfile } from "react-icons/ai";
import { Navitems } from "./Navitems";
import { Logo } from "./Logo";
import { useState , useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export function Header() {
  const pages = [
    { name: "/", icon: <AiFillHome /> },
    { name: "Friend", icon: <AiOutlineGroup /> },
    { name: "Profile", icon: <AiOutlineProfile /> },
    { name: "Watch", icon: <AiOutlineProfile /> },
    { name: "Noti", icon: <AiOutlineProfile /> },
    { name: "Menu", icon: <AiOutlineProfile /> },
  ];

  useEffect(() => {
    const content = document.querySelectorAll('#content > div')
    let options = {
      root: document.querySelector("#content"),
      rootMargin: "0px",
      threshold: .5,
    };
    function handleObserver(entries:any){
      entries.map( (entry:any) => {
      if(entry.isIntersecting){
        setActive(entry.target.id)
        console.log(entry.target.id); 
      }
      })
    }

    const observer = new IntersectionObserver(handleObserver,options)
    content.forEach( item =>{
      observer.observe(item)
    })
  }, [])
  

  // const router = useRouter()
  // const currentRoute = router.pathname
  // const navName = pages.name
  const [active, setActive] = useState("");

  return (
    <>
      <header className={styles.header}>
        <Logo />
      </header>

      <nav className={styles.nav}>
        {pages.map((page, index) => (
          <Navitems
            active={active}
            setActive={setActive}
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