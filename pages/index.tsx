import { getAuth, onAuthStateChanged, onIdTokenChanged } from "firebase/auth";
import { collection, collectionGroup, getDocs } from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useEffect, useRef, useState } from "react";
import Header from "../components/Header/Header";
import Tabs from "../components/Tabs";
import { Welcome } from "../components/Welcome";
import { useActive } from "../hooks/useActiveTab";
import { app, db } from "../lib/firebase";
import { getUserData, verifyIdToken } from "../lib/firebaseAdmin";
import styles from "../styles/Home.module.scss";
import { Post, Props } from "../types/interfaces";
import { AppProvider } from "../context/AppContext";
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    const token = await verifyIdToken(cookies.token);
    // if (!token) return;
    const { email, uid } = token;
    // console.log(token);
    let expired = false;
    const query = collectionGroup(db, `posts`);
    const allUsersQuery = collectionGroup(db, `users`);
    const mypostQuery = collection(db, `/users/${uid}/posts`);
    const docSnap = await getDocs(query);
    const allUsersSnap = await getDocs(allUsersQuery);
    const myPostSnap = await getDocs(mypostQuery);
    const posts = docSnap.docs.map((doc) => {
      // getting all users posts
      // db/users/uid-JE0sy/posts/abc
      const data = doc.data() as Post;
      return {
        authorId: doc.ref.parent.parent?.id,
        id: doc.id,
        ...data,
      };
    });
    const myPost = myPostSnap.docs.map((doc) => {
      const data = doc.data() as Post;
      return {
        authorId: doc.ref.parent.parent?.id,
        id: doc.id,
        ...data,
      };
    });
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
    console.log(allUsers);
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
        if (!expired) return;
        router.push("/");
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);
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
  }, [active, email]);
  // const [user, setuser] = useState<User | null>(null);

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
