import styles from "../styles/Home.module.css";
import useActive from "../hooks/useActive";
import { useEffect } from "react";
import { useRouter } from "next/router";

export function Navitems(props: any) {
  const { icon, name, index } = props;
  const targetName = name.toLowerCase();
  const { active, setActive } = useActive();
  const router = useRouter();

  useEffect(() => {
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
  }, [active]);

  const isActive = active === targetName ? styles.active : "";
  function handleClick(e: any) {
    // router.push(`${targetName !=  '/' ? "#"+targetName : targetName }`);
    window.location.hash = targetName === "/" ? "#home" : "#" + targetName;
    

    setActive(targetName);
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
