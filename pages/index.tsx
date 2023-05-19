import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, collectionGroup, getDocs } from "firebase/firestore";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useContext, useEffect, useRef, useState } from "react";
import Header from "../components/Header/Header";
import Tabs from "../components/Tabs";
import { useActive } from "../hooks/useActiveTab";
import { app, db } from "../lib/firebase";
import { verifyIdToken } from "../lib/firebaseAdmin";
import styles from "../styles/Home.module.scss";
import { Post } from "../types/interfaces";
import AuthContext from "../context/AuthContext";

export interface Props {
  myPost?: Post[];
  posts?: Post[];
  email?: string | null;
  indicatorRef?: React.RefObject<HTMLDivElement>;
}
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    // console.log(cookies.token);
    const token = await verifyIdToken(cookies.token);
    const { email, uid } = token;
    // console.log(token);
    console.log(email);

    const query = collectionGroup(db, `posts`);
    const mypostQuery = collection(db, `/users/${uid}/posts`);
    const docSnap = await getDocs(query);
    const myPostSnap = await getDocs(mypostQuery);
    const posts = docSnap.docs.map((doc) => {
      const data = doc.data() as Post;
      return {
        ...data,
      };
    });
    const myPost = myPostSnap.docs.map((doc) => {
      const data = doc.data() as Post;
      return {
        ...data,
      };
    });

    return {
      props: {
        posts,
        email,
        myPost,
      },
    };
  } catch {
    context.res.writeHead(302, { Location: "/login" });
    context.res.end();
    return {
      props: {
        posts: [],
        email: "",
        myPost: [],
      },
    };
  }
};
export default function Home(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { posts, email, myPost } = props;
  const indicatorRef = useRef<HTMLDivElement>(null);

  const { active, setActive } = useActive();
  const router = useRouter();
  const auth = getAuth(app);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const [AddpostMounted, setAddpostMounted] = useState(false);
  const { user } = useContext(AuthContext);
  // const user = useUser();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        router.push("/");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

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
  if (!email) return <h2>Loading ...</h2>;
  return (
    <>
      {/* {user?.email} */}
      <div ref={headerContainerRef} className={styles.headerContainer}>
        <Header indicatorRef={indicatorRef} email={email} />
      </div>
      <Tabs
        myPost={myPost}
        indicatorRef={indicatorRef}
        email={email}
        posts={posts}
      />
    </>
  );
}
