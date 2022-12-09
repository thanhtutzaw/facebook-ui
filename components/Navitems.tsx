import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import Link from "next/link";

export function Navitems(props: any) {
  const { icon, name , index } = props;
  // const router = useRouter();
  // const currentRoute = router.pathname.toLowerCase();
  let navName = name.toLowerCase();
  // if(router.pathname !== '/'){
  //   navName = "/" + name.toLowerCase();
  // }

  return (
    <>
       <div
       
       
          // href={name.toLowerCase()}
          onClick={(e)=>{
            // router.replace(name.toLowerCase())
            const target = e.target as HTMLDivElement;
            const content = document.getElementById('content')
            content?.scrollTo({
              left: index * content.clientWidth,
              behavior:'smooth'
            });
            // console.log(content?.clientWidth);
            // console.log(index);
            
            // console.log(element);
            // console.log(name);
          }}

            className={`${styles.navItems} 
            ${
              !navName ? styles.active : ""
           }`
          }
          >
           {icon}
         </div>
    </>
  );
}
