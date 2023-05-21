import { getAuth, onIdTokenChanged, onAuthStateChanged } from "firebase/auth";
import { collection, collectionGroup, getDocs } from "firebase/firestore";
import { GetServerSideProps } from "next";
import router, { useRouter } from "next/router";
import Header from "../components/Header/Header";
import Tabs from "../components/Tabs";
import { AuthProvider } from "../context/AuthContext";
import { useActive } from "../hooks/useActiveTab";
import { app, db } from "../lib/firebase";
import { verifyIdToken } from "../lib/firebaseAdmin";
import styles from "../styles/Home.module.scss";
import { Post, Props } from "../types/interfaces";
import nookies from "nookies";
import { useRef, useEffect } from "react";
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    const token = await verifyIdToken(cookies.token);
    const { email, uid } = token;
    console.log(token);

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
        };
      })
      .filter((users) => users.id !== uid);
    console.log(posts);

    return {
      props: {
        uid,
        allUsers,
        posts,
        email,
        myPost,
      },
    };
  } catch (error) {
    console.log(error);
    // context.res.writeHead(302, { Location: "/login" });
    // context.res.end();
    return {
      props: {
        uid: "",
        allUsers: [],
        posts: [],
        email: "",
        myPost: [],
      },
    };
  }
};
export default function Home({ uid, allUsers, posts, email, myPost }: Props) {
  // props: InferGetServerSidePropsType<typeof getServerSideProps>
  // const { posts, email, myPost } = useContext(AuthContext) as Props;
  const indicatorRef = useRef<HTMLDivElement>(null);

  const { active, setActive } = useActive();
  const router = useRouter();
  const auth = getAuth(app);
  const headerContainerRef = useRef<HTMLDivElement>(null);
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
  }, [active]);
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        nookies.destroy(undefined, "token");
        return;
      }
      try {
        const token = await user.getIdToken();
        // Store the token in a cookie
        nookies.set(undefined, "token", token, {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
          secure: true,
        });
      } catch (error) {
        console.log("Error refreshing ID token:", error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);
  if (!email)
    return (
      <div
        style={{
          opacity: "0",
          animation: "blink .8s forwards ease-in-out",
          cursor: "wait",
          display: "grid",
          alignContent: "center",
          height: "100vh",
        }}
      >
        <h2
          style={{
            userSelect: "none",
            textAlign: "center",
          }}
        >
          Welcome Back 🎉
        </h2>
        <p
          style={{
            userSelect: "none",
            // opacity: "0",
            // animation: "blink 1s infinite ease-in-out",
            textAlign: "center",
            color: "gray",
          }}
        >
          Loading ...
        </p>
      </div>
    );

  return (
    // <AuthProvider value={{ posts, email, myPost }}>
    <AuthProvider
      uid={uid}
      allUsers={allUsers}
      posts={posts}
      email={email}
      myPost={myPost}
    >
      <div ref={headerContainerRef} className={styles.headerContainer}>
        <Header indicatorRef={indicatorRef} email={email} />
      </div>
      <Tabs
        myPost={myPost}
        indicatorRef={indicatorRef}
        email={email}
        posts={posts}
      />
    </AuthProvider>
  );
}
