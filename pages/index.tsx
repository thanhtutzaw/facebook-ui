import styles from "../styles/Home.module.css";
import { Content } from "../components/Content";
import { useEffect } from "react";
import useActive from "../hooks/useActive";
import { useRouter } from "next/router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app, db } from "../lib/firebase";
import { useUser } from "../hooks/useUser";
import { collection, collectionGroup, doc, getDoc, getDocs } from "firebase/firestore";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import nookies from 'nookies'
import {verifyIdToken} from '../lib/firebaseAdmin'
// async function fetchUser() {
//   const res = await fetch("https://jsonplaceholder.typicode.com/users");
//   const data = await res.json();
//   return data;
// }
export const getServerSideProps:GetServerSideProps = async(context)=> {
  // console.log(context)
    // const { user } = useUser();
    let posts = null;
    const cookies = nookies.get(context)
    // console.log(cookies)
    const token = await verifyIdToken(cookies.token)
    // console.log(cookies.token);
    console.log(token)
    const {uid} = token;



    const docRef = collectionGroup(db, `posts`);
    // const docRef = collection(db, `/users/${uid}/posts`);
    // const docRef = doc(db, `/users/${uid}/posts/MqmLWlWY9B9XkBYiNkdh`);
    // const docRef = doc(db, `/users/${user?.uid}/posts/MqmLWlWY9B9XkBYiNkdh`);
    const docSnap = await getDocs(docRef);
    posts = docSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

  return {
    props: {
      // posts: docSnap.data(),
      posts
    },
  };
}
export default function Home(props:InferGetServerSidePropsType<typeof getServerSideProps>) {
  const {posts} = props
  console.log(posts);

  const { active } = useActive();
  const router = useRouter();
  const auth = getAuth(app);
  const user = useUser();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });
  }, []);

  // const path = active === '/' ? '#home' : '#'+active
  useEffect(() => {
    const content = document.getElementById("content");
    const main = document.getElementsByTagName("main")[0];
    // const nav = document.getElementsByTagName("nav")[0];
    const header = document.getElementsByTagName("header")[0];
    const headerContainer = document.getElementsByClassName(
      "Home_headerContainer__dbWZE"
    )[0] as HTMLDivElement;

    if (window.location.hash !== "#home") {
    } else {
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

    // if (window.location.hash === "#home" || window.location.hash === "") {";
    //   header.style.display = "block";
    //   main.scrollTo({
    //     top: 0,
    //     behavior: "smooth",
    //   });
    // }
    // else {
    //   header.ontransitionend = () => {
    //     header.style.display = "none";
    //   };
    //   main.scrollTo({
    //     top: 0,
    //     behavior: "smooth",
    //   });
    // }
    //hereeee

    // console.log(window.location.hash === "")
    if (window.location.hash === "" || window.location.hash === "#home") {
      content?.scrollTo({
        left: 0,
        behavior: "smooth",
      });
      // window.location.hash = "#home"
    }
    window.onhashchange = (e) => {
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
        headerContainer.style.transform = "translateY(-60px)";
        headerContainer.style.height = "60px";
        header.ontransitionend = () => {};
      }
    };
    // main.addEventListener("scroll", handleScroll);

    // function handleScroll() {
    //   if (main.scrollTop > 60) {
    //     // nav.classList.add(styles.sticky);
    //     // main.style.scrollSnapType = "none";
    //   } else if (window.location.hash !== "#home") {
    //     // nav.classList.add(styles.sticky);
    //     // nav.classList.remove(styles.sticky);
    //     // main.style.scrollSnapType = "y mandatory";
    //   } else {
    //     // nav.classList.remove(styles.sticky);
    //     //here 
    //   }

    //   // if (window.location.hash === "#home" || main.scrollTop > 60) {
    //   // }
    // }


    // return () => window.removeEventListener("scroll", handleScroll);
  }, [router, active]);

  return (
    <>
      <Content posts={posts}/>
    </>
  );
}