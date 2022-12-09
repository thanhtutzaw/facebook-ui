import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import Link from "next/link";

export function Navitems(props: any) {
  const { icon, name } = props;
  const router = useRouter();
  const currentRoute = router.pathname.toLowerCase();
  let navName = name.toLowerCase();
  if(router.pathname !== '/'){
    navName = "/" + name.toLowerCase();
  }

  return (
    <>
       <Link
          href={name.toLowerCase()}
            className={`${styles.navItems} ${
              currentRoute === navName ? styles.active : ""
           }`}
          >
           {icon}
         </Link>
    </>
  );
}
