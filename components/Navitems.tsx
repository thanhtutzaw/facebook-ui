import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";

export function Navitems(props: any) {
  const { icon, name, index ,active ,setActive} = props;
          const targetName = name.toLowerCase();

  // const router = useRouter();
  // const currentRoute = router.pathname.toLowerCase();
  // if(router.pathname !== '/'){
  //   navName = "/" + name.toLowerCase();
  // }
  return (
    <>
      <div
        // id={name}
        // href={name.toLowerCase()}
        onClick={(e) => {
          const target = e.target as HTMLDivElement
          // const targetID = target?.id.toLowerCase();
          // console.log();
          // e.stopPropagation()
          // setActive(targetName)
          // console.log(active);
          // if(targetID !== targetName){
          //   setActive(false)
          // }else{
          //   setActive(true)
          // }
          // router.replace(name.toLowerCase())
          // const target = e.target as HTMLDivElement;
          const content = document.getElementById("content");
          content?.scrollTo({
            left: index * content.clientWidth,
            behavior: "smooth",
          });
        }}

        className={`${styles.navItems} ${active === targetName ? styles.active : ""} `}

        // target.classList.toggle('active')
        // console.log(target.style.contain="border-bottom");

        // target.classList.remove(styles.active)
        // if(target.id.toLowerCase() == name.toLowerCase()){
        //   target.classList.toggle(styles.active);
        // }

        // if (target.id.toLowerCase() === name.toLowerCase()){

        //   target.classList.add(styles.active);
        // }else{
        //   target.classList.remove(styles.active);
        // }

        // console.log(content?.clientWidth);
        // console.log(index);

        // console.log(element);
        // console.log(name);
        >
        {icon}
      </div>
    </>
  );
}
