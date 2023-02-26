import styles from "../../styles/Home.module.css";
import { useEffect } from "react";
import { useRouter } from "next/router";
import useActive from "../../hooks/useActive";

export function Navitems(props: any) {
  const { icon, name, index } = props;
  const targetName = name.toLowerCase();
  const { active, setActive } = useActive();
  const router = useRouter();

  // const indicator = document.querySelector('.indicatorContainer>.indicator')
  // console.log(indicator);
  useEffect(() => {
    //     const indicator = document.getElementsByClassName(
    //       "Home_indicator__htkkp"
    //     )[0] as HTMLDivElement;
    // const nav = document.getElementsByTagName('nav')[0]
    //       indicator.style.border = "3px solid red"
    // console.log(index/nav.clientWidth)
    // navItem.style.transform = `translateX${83*index}px`
    // if (navItem.length > 0) {
    //   const first = navItem[0];
    //   console.log(first.innerText); // 👉️ "Box 1"
    // }
    // Array.from(navItem).forEach((item) => {
    //   console.log(item);
    // });
    // console.log(active)
    // window.onhashchange(()=>{
    // })
    // function updateHistory(curr) {
    //   window.location.lasthash.push(window.location.hash);
    //   window.location.hash = curr;
    // }
    // console.log(router.asPath === "/");
    // if(router.asPath === ''){
    //   const content = document.getElementById("content");
    //   content?.scrollTo({
    //     left: 0 * content.clientWidth,
    //     behavior: "smooth",
    //   });
    // }
  }, []);

  const isActive = active === targetName ? styles.active : "";
  function handleClick(e: any) {
    // router.push(`${targetName !=  '/' ? "#"+targetName : targetName }`);
    setActive(targetName);
    window.location.hash = targetName === "/" ? "#home" : "#" + targetName;

    const content = document.getElementById("content");
    content?.scrollTo({
      left: index * content.clientWidth,
      behavior: "smooth",
    });
  }
  return (
    <>
      <div
        // href={`${name === '/' ? " #home" : "#"+name.toLowerCase()}`}
        onClick={handleClick}
        className={`${styles.navItems} ${isActive} `}
      >
        {icon}
      </div>
    </>
  );
}
