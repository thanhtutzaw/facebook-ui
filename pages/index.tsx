import styles from "../styles/Home.module.css";
import { Content } from "../components/Content";
import { useEffect } from "react";
import useActive from "../hooks/useActive";
import { useRouter } from "next/router";

export default function Home() {
  const { active } = useActive();
  const router = useRouter();
  // const path = active === '/' ? '#home' : '#'+active
  // console.table("path= " + path);

  useEffect(() => {
    const content = document.getElementById("content");
    const main = document.getElementsByTagName("main")[0];
    const header = document.getElementsByTagName("header")[0];

    if (window.location.hash === "#home" || window.location.hash === "") {
      header.style.transform = "translateY(0px)";
      // header.style.opacity = "1";
      header.style.display = "block";
      main.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      header.style.transform = "translateY(-50px)";
      header.ontransitionend = () => {
        header.style.display = "none";
      };
      // header.style.opacity = '0'
      // header.style.display = 'none'
      // header.style.visibility = 'hidden'
      main.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      console.log(header);
      // main.scrollTo({
      //   top: 60,
      //   behavior: "smooth",
      // });
    }
    //hereeee

    // console.log(active)
    // if (active) {
    //   window.location.hash = active === "/" ? "#home" : "#" + active;
    // }

    // router.push('/')
    // router.push()
    // console.log(path)
    // router.push(path).then(()=>{
    //   if(active){
    //     router.push(path);
    //   }
    // })
    // console.log(active);
    // router.push("#"+active)
    if (router.asPath === "/") {
      // main.scrollTo({
      //   top: 60,
      //   behavior: "smooth",
      // });
    }
    // console.log(window.location.hash === "")
    if (window.location.hash === "" || window.location.hash === "#home") {
      content?.scrollTo({
        left: 0,
        behavior: "smooth",
      });
      // window.location.hash = "#home"
    }
    // console.log(router.asPath)
    window.onhashchange = (e) => {
      // console.log(window.location.lasthash);
      // e.preventDefault()
      // console.log(window.location.hash === "#home");
      if (window.location.hash === "" || window.location.hash === "#home") {
        // main.scrollTo({
        //   top: 0,
        //   behavior: "smooth",
        // });
        content?.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      }
    };

    const nav = document.getElementsByTagName("nav")[0];

    main.addEventListener("scroll", handleScroll);
    function handleScroll() {
      // if (main.scrollTop > 60) {
      //   nav.classList.add(styles.sticky);
      //   main.style.scrollSnapType = "";
      // } else {
      //   nav.classList.remove(styles.sticky);
      //   main.style.scrollSnapType = "y mandatory";
      // }
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, [router, active]);

  return (
    <>
      <Content />
    </>
  );
}
