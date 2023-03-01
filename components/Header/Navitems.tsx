import { useEffect } from "react";
import { useActive } from "../../hooks/useActive";
import styles from "../../styles/Home.module.scss";

export default function Navitems(props: any) {
  const { icon, name, index } = props;
  const TabName = name.toLowerCase();
  const { active, setActive } = useActive();
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

  const isActive = active === TabName ? styles.active : "";
  const hashValue = TabName === "/" ? "#home" : "#" + TabName;
  function handleClick() {
    // router.push(`${TabName !=  '/' ? "#"+TabName : TabName }`);
    setActive(TabName);
    window.location.hash = hashValue;

    const tabs = document.getElementById("tabs");
    tabs?.scrollTo({
      left: index * tabs.clientWidth,
      // behavior: "smooth",
    });
  }
  return (
    <>
      <div onClick={handleClick} className={`${styles.navItems} ${isActive} `}>
        {icon}
      </div>
    </>
  );
}
