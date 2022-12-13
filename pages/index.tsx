import styles from "../styles/Home.module.css";
import { Content } from "../components/Content";
import { useEffect } from "react";
import useActive from "../hooks/useActive";
import { useRouter } from "next/router";

export default function Home() {
  
  useEffect(() => {
    
    window.onhashchange = () => {
      if (window.location.hash === "") {
        const content = document.getElementById("content");
        content?.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      }
      // console.log(window.location.hash === "");
    };
    // console.log(router)
    const nav = document.getElementsByTagName("nav")[0];
    const main = document.getElementsByTagName("main")[0];

    main.addEventListener("scroll", handleScroll);
    function handleScroll() {
      if (main.scrollTop > 60) {
        nav.classList.add(styles.sticky);
        main.style.scrollSnapType = "";
      } else {
        nav.classList.remove(styles.sticky);
        main.style.scrollSnapType = "y mandatory";
      }
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Content />
    </>
  );
}
