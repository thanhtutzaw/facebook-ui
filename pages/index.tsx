import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  Timestamp,
  collection,
  collectionGroup,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useEffect, useRef } from "react";
import Header from "../components/Header/Header";
import Tabs from "../components/Tabs";
import { Welcome } from "../components/Welcome";
import { AppProvider } from "../context/AppContext";
import { useActive } from "../hooks/useActiveTab";
import { app, db, postToJSON } from "../lib/firebase";
import { getUserData, verifyIdToken } from "../lib/firebaseAdmin";
import styles from "../styles/Home.module.scss";
import { Post, Props } from "../types/interfaces";
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    const token = await verifyIdToken(cookies.token);
    // if (!token) return;
    const convertSecondsToTime = (seconds: number) => {
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      return { days, hours, minutes, seconds: remainingSeconds };
    };
    console.log(convertSecondsToTime(token.exp));
    const { email, uid } = token;
    // console.log(token);
    let expired = false;

    const allUsersQuery = collectionGroup(db, `users`);
    const allUsersSnap = await getDocs(allUsersQuery);

    const postQuery = query(
      collectionGroup(db, `posts`),
      orderBy("createdAt", "desc")
    );
    const docSnap = await getDocs(postQuery);
    const posts = docSnap.docs.map((doc) => postToJSON(doc));

    // const getDate = (post: Post) => {
    //   const date = new Timestamp(
    //     post.createdAt.seconds,
    //     post.createdAt.nanoseconds
    //   );
    //   return {
    //     date,
    //   };
    // };
    // .sort((a, b) => a.createdAt - b.createdAt);

    // getting all users posts
    // db/users/uid-JE0sy/posts/abc
    // const data = doc.data() as Post;
    const mypostQuery = query(
      collection(db, `/users/${uid}/posts`),
      orderBy("createdAt", "desc")
    );
    const myPostSnap = await getDocs(mypostQuery);

    const myPost = myPostSnap.docs.map((doc) => postToJSON(doc));
    const allUsers = allUsersSnap.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          ...getUserData(doc.id),
        };
      })
      .filter((users) => users.id !== uid);
    // const allUser = allUsers.map(async (user) => {
    //   await getUserData(user.id, allUsers);
    // });
    // console.log(sort);
    return {
      props: {
        expired,
        uid,
        // allUsers: allUser,
        allUsers,
        posts,
        email,
        myPost,
      },
    };
  } catch (error) {
    console.log("SSR Error " + error);
    // context.res.writeHead(302, { Location: "/" });
    // context.res.writeHead(302, { Location: "/login" });
    // context.res.end();
    return {
      props: {
        expired: true,
        uid: "",
        allUsers: [],
        posts: [],
        email: "",
        myPost: [],
      },
    };
  }
};
export default function Home({
  expired,
  uid,
  allUsers,
  posts,
  email,
  myPost,
}: Props) {
  // props: InferGetServerSidePropsType<typeof getServerSideProps>
  // const { posts, email, myPost } = import { AppContext } from "../../../context/AppContext"; as Props;
  const indicatorRef = useRef<HTMLDivElement>(null);

  const { active } = useActive();
  const router = useRouter();
  const auth = getAuth(app);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        // if (active === "" && auth.currentUser) return;
        // if (email === "") return;
        // if (email) return;
        // if (!expired && window.location.hash === "#home") return;
        if (!expired) return;
        router.push("/");
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, expired]);
  useEffect(() => {
    const tabs = document.getElementById("tabs");
    const main = document.getElementsByTagName("main")[0];

    const headerContainer = headerContainerRef?.current;
    if (window.location.hash === "" || window.location.hash === "#home") {
      if (!headerContainer) return;
      console.log(headerContainerRef.current);
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
    if (active === "/") window.location.hash = "#home";
  }, [active]);

  // if (!email || expired) return <Welcome email={""} expired={expired!} />;
  if (expired) return <Welcome />;
  // if (expired && email) return <Welcome />;
  // if (expired && auth.currentUser) return <Welcome />;
  // if (!auth.currentUser)
  //   return (
  //     <div
  //       style={{
  //         alignContent: "center",
  //         justifyItems: "center",
  //         textAlign: "center",
  //         height: "100vh",
  //         userSelect: "none",
  //         display: "grid",
  //         justifyContent: "center",
  //       }}
  //     >
  //       <p style={{ textAlign: "center", color: "gray" }}>Loading...</p>;
  //     </div>
  //   );
  // if (!email) return <></>;
  return (
    // <AuthProvider value={{ posts, email, myPost }}>
    <AppProvider
      uid={uid}
      allUsers={allUsers}
      posts={posts}
      email={email}
      myPost={myPost}
    >
      {/* {router.asPath} */}
      <div ref={headerContainerRef} className={styles.headerContainer}>
        <Header
          headerContainerRef={headerContainerRef}
          indicatorRef={indicatorRef}
        />
        {/* {expired ? "true" : "false"} */}
      </div>
      <Tabs indicatorRef={indicatorRef} />
    </AppProvider>
  );
}
