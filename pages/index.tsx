import Head from "next/head";
import { useState } from "react";
import styles from "../styles/Home.module.css";
import { AiFillHome } from "react-icons/ai";
import { AiOutlineGroup } from "react-icons/ai";
import { AiOutlineProfile } from "react-icons/ai";
import { Router, useRouter } from "next/router";
import Draggable from "react-draggable";
import Link from "next/link";
const pages = [
  { name: "/", icon: <AiFillHome /> },
  { name: "Friend", icon: <AiOutlineGroup /> },
  { name: "Profile", icon: <AiOutlineProfile /> },
  { name: "Noti", icon: <AiOutlineProfile /> },
  { name: "Watch", icon: <AiOutlineProfile /> },
  { name: "Menu", icon: <AiOutlineProfile /> },
];
// const pages = [
//   { name: <AiFillHome /> },
//   { name: "Friend" },
//   { name: "Profile" },
//   { name: "Noti" },
//   { name: "Watch" },
//   { name: "Menu" },
// ];
function Story() {
  return <div className={styles.storyContainer}>Story</div>;
}
function Posts() {
  return <div className={styles.postContainer}>Posts</div>;
}

function Navitems(props: any) {
  const {icon , name} = props;
  // const [active, setactive] = useState(false);
  const router =useRouter()
  const currentRoute = router.pathname.toLowerCase()
  const navName = name.toLowerCase()

  // function toggleActive(e: any) {
  //   const target = e.target as HTMLElement;
  //   setactive((prev: any) => !prev);
  // }
  return (
    <>
      <Link
        href={navName}
        className={`${styles.navItems} ${currentRoute === navName ? styles.active : ""}`}
      >
        {icon}
      </Link>
    </>
  );
}

export default function Home() {
  

  return (
    <>
      <Head>
        <title>Facebook Next</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.logoContainer}>
            <Link href="/" className={styles.logo}>
              facebook
            </Link>
          </div>

          <nav className={styles.nav}>
            {pages.map((page) => (
              <Navitems
                key={page.name}
                name={page.name}
                icon={page.icon}
              ></Navitems>
            ))}
          </nav>
        </header>

          <div className={styles.content}>
            <div className={styles.home}>
              <Story />
              <Posts />
            </div>
            <div className={styles.add}>add</div>
            <div className={styles.profile}>profile</div>
          </div>
      </main>
    </>
  );
}
