import styles from "../styles/Home.module.css";
import { Content } from "../components/Content";
import { useEffect } from "react";
import useActive from "../hooks/useActive";
import { useRouter } from "next/router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../lib/firebase";
import { useUser } from "../hooks/useUser";

export default function Home() {
  const { active } = useActive();
  const router = useRouter();
  const auth = getAuth(app);
  const user = useUser();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      } else {
        console.log("no user in index");
        router.push("/login");
      }
    });
  }, []);

  // const path = active === '/' ? '#home' : '#'+active
  // console.table("path= " + path);

  useEffect(() => {
    const content = document.getElementById("content");
    const main = document.getElementsByTagName("main")[0];
    const nav = document.getElementsByTagName("nav")[0];
    const header = document.getElementsByTagName("header")[0];
    const headerContainer = document.getElementsByClassName(
      "Home_headerContainer__dbWZE"
    )[0] as HTMLDivElement;

    // main.scrollTo({
    //   top: 0,
    //   behavior: "smooth",
    // });
    if (window.location.hash !== "#home") {
    } else {
      // header.style.transform = "translateY(0px)";
      // header.style.height = "auto";
      // nav.style.transform = "translateY(0px)";
      headerContainer.style.transform = "translateY(0px)";
      headerContainer.style.height = "120px";
      // main.style.scrollSnapType = "none";

      main.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    // main.scrollTo({
    //   top: 0,
    //   behavior: "smooth",
    // });

    // header.style.display = 'block'

    // if (window.location.hash === "#home" || window.location.hash === "") {
    //   header.style.transform = "translateY(0px)";
    //   header.style.display = "block";
    //   main.scrollTo({
    //     top: 0,
    //     behavior: "smooth",
    //   });
    // }
    // else {
    //   header.style.transform = "translateY(-20px)";
    //   header.ontransitionend = () => {
    //     header.style.display = "none";
    //   };
    //   main.scrollTo({
    //     top: 0,
    //     behavior: "smooth",
    //   });
    // }
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
      // if (window.location.hash !== "#home") {

      // }
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
      } else {
        main.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        main.style.scrollSnapType = "none";
        // header.style.transform = "translateY(-60px)";
        // header.style.height = "0px";
        // nav.style.transform = "translateY(0px)";
        // headerContainer.style.transform = "translateY(-60px)";
        headerContainer.style.transform = "translateY(-60px)";
        headerContainer.style.height = "60px";
        // header.style.display = "block";
        // nav.style.height = "auto";
        header.ontransitionend = () => {
          // header.style.height = "0px";
          // header.style.display = "none";
        };
      }
    };

    // const nav = document.getElementsByTagName("nav")[0];

    main.addEventListener("scroll", handleScroll);
    function handleScroll() {
      // header.style.height = '0px'
      // header.style.opacity = '0'
      // header.style.display = 'none'
      if (main.scrollTop > 60) {
        // nav.classList.add(styles.sticky);
        // main.style.scrollSnapType = "none";
        // headerContainer.style.height = "60px";
      } else if (window.location.hash !== "#home") {
        // headerContainer.style.height = "60px";
        // headerContainer.style.transform = "translateY(0px)";
        // nav.classList.add(styles.sticky);
        // nav.classList.remove(styles.sticky);
        // main.style.scrollSnapType = "y mandatory";
      } else {
        nav.classList.remove(styles.sticky);
        // headerContainer.style.height = "120px";
      }

      if (window.location.hash === "#home" || main.scrollTop > 60) {
        // header.style.display = "block";
        // header.style.opacity = "1";
        // header.style.transform = "translateY(0px)";
      }
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, [router, active]);

  return (
    <>
      <Content />
    </>
  );
}
