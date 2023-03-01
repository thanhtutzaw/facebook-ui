import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collectionGroup, getDocs } from "firebase/firestore";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useEffect, useRef } from "react";
import Header from "../components/Header/Header";
import { useActive } from "../hooks/useActive";
import { app, db } from "../lib/firebase";
import { verifyIdToken } from "../lib/firebaseAdmin";
import styles from "../styles/Home.module.scss";
import { Post } from "../types/interfaces";
import Tabs from "../components/Tabs";

export interface Props {
  posts: Post[];
  email?: string | null;
  indicatorRef?: React.RefObject<HTMLDivElement>;
}
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    console.log(cookies.token);

    const token = await verifyIdToken(cookies.token);
    const { email  } = token;
    // const email = "null email";

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
  const indicatorRef = useRef<HTMLDivElement>(null);

  const { active, setActive } = useActive();
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
    const tabs = document.getElementById("tabs");
    const main = document.getElementsByTagName("main")[0];
    const headerContainer = headerContainerRef.current;
    if (window.location.hash === "#home" && headerContainer) {
      headerContainer.style.transform = "translateY(0px)";
      headerContainer.style.height = "120px";
      main.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
    //hereeee

    if (window.location.hash === "" || window.location.hash === "#home") {
      tabs?.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    }
    window.onhashchange = (e) => {
      if (window.location.hash === "" || window.location.hash === "#home") {
        tabs?.scrollTo({
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
      }
    };

    console.log(active);
  }, [router, active, setActive]);

  return (
    <>
      <div ref={headerContainerRef} className={styles.headerContainer}>
        <Header indicatorRef={indicatorRef} email={email} />
      </div>
      <Tabs indicatorRef={indicatorRef} email={email} posts={posts} />
    </>
  );
}
