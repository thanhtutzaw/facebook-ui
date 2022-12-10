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
       id={name}
          // href={name.toLowerCase()}
          onClick={(e)=>{
            // router.replace(name.toLowerCase())
            const target = e.target as HTMLDivElement;
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

            className={`${styles.navItems} `
          }
          >
           {icon}
         </div>
    </>
  );
}