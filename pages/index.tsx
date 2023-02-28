import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collectionGroup, getDocs } from "firebase/firestore";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useEffect, useRef } from "react";
import { Content } from "../components/Content";
import Header from "../components/Header/Header";
import { useActive } from "../hooks/useActive";
import { app, db } from "../lib/firebase";
import { verifyIdToken } from "../lib/firebaseAdmin";
import styles from "../styles/Home.module.scss";
import { Post } from "../types/interfaces";
// async function fetchUser() {
//   const res = await fetch("https://jsonplaceholder.typicode.com/users");
//   const data = await res.json();
//   return data;
// }
export interface Props {
  posts: Post[];
  email: string | undefined;
  // indicatorContainerRef: HTMLDivElement;
  indicatorContainerRef?: React.RefObject<HTMLDivElement>;
}
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    console.log(cookies.token);

    const token = await verifyIdToken(cookies.token);
    const { email } = token;
    // const email = "null email";

    // console.log(token);
    // const uid = null;

    const query = collectionGroup(db, `posts`);
    // const docRef = collection(db, `/users/${uid}/posts`);
    // const docRef = doc(db, `/users/${uid}/posts/MqmLWlWY9B9XkBYiNkdh`);
    // const docRef = doc(db, `/users/${user?.uid}/posts/MqmLWlWY9B9XkBYiNkdh`);
    const docSnap = await getDocs(query);
    const posts = docSnap.docs.map((doc) => {
      const data = doc.data() as Post;
      return {
        // id: doc.id,
        ...data,
      };
    });

    return {
      props: {
        posts,
        email,
      },
    };
  } catch {
    context.res.writeHead(302, { Location: "/login" });
    context.res.end();
    return {
      props: {
        posts: [],
        email: "",
      },
    };
  }
};
export default function Home(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { posts, email } = props;
  const indicatorContainerRef = useRef<HTMLDivElement>(null);

  const { active } = useActive();
  const router = useRouter();
  const auth = getAuth(app);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  // const user = useUser();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });
  }, [auth, router]);

  // const path = active === '/' ? '#home' : '#'+active
  useEffect(() => {
    const content = document.getElementById("content");
    const main = document.getElementsByTagName("main")[0];
    // const nav = document.getElementsByTagName("nav")[0];
    // const header = document.getElementsByTagName("header")[0];
    const headerContainer = headerContainerRef.current;
    // const headerContainer = document.getElementsByClassName(
    //   "Home_headerContainer__B6rj0"
    // )[0] as HTMLDivElement;
    // const headerContainer = document.getElementsByClassName(
    //   "Home_headerContainer__dbWZE"
    // )[0] as HTMLDivElement;

    if (window.location.hash === "#home" && headerContainer) {
      headerContainer.style.transform = "translateY(0px)";
      headerContainer.style.height = "120px";
      main.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      // if (!content) return;
      // content.style.height = "100vh";
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

    if (window.location.hash === "" || window.location.hash === "#home") {
      content?.scrollTo({
        left: 0,
        behavior: "smooth",
      });
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
        if (!headerContainer) return;
        headerContainer.style.transform = "translateY(-60px)";
        headerContainer.style.height = "60px";

        // header.ontransitionend = () => {};
      }
    };
    // if (content) {
    //   content.style.height = "100vh";
    // }
    // if (active) {
    //   window.location.hash = active === "/" ? "#home" : "#" + active;
    // }
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
    console.log(active);
  }, [router, active]);

  return (
    <>
      <div ref={headerContainerRef} className={styles.headerContainer}>
        <Header indicatorContainerRef={indicatorContainerRef} email={email} />
      </div>
      <Content
        indicatorContainerRef={indicatorContainerRef}
        email={email}
        posts={posts}
      />
    </>
  );
}
