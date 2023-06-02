import {
  collection,
  collectionGroup,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useContext, useEffect, useRef } from "react";
import BackHeader from "../../components/Header/BackHeader";
import Input from "../../components/Input";
import { PageContext, PageProps } from "../../context/PageContext";
import { db, postToJSON } from "../../lib/firebase";
import { verifyIdToken } from "../../lib/firebaseAdmin";
import s from "../../styles/Home.module.scss";
import { Post, Props } from "../../types/interfaces";
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    const token = await verifyIdToken(cookies.token);
    // if (!token) return;
    // const convertSecondsToTime = (seconds: number) => {
    //   const days = Math.floor(seconds / (3600 * 24));
    //   const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    //   const minutes = Math.floor((seconds % 3600) / 60);
    //   const remainingSeconds = seconds % 60;

    //   return { days, hours, minutes, seconds: remainingSeconds };
    // };
    // console.log(convertSecondsToTime(token.exp));
    const { email, uid } = token;
    let expired = false;

    // const allUsersQuery = collectionGroup(db, `users`);

    const postQuery = query(
      collectionGroup(db, `posts`),
      orderBy("createdAt", "desc")
    );
    // const docSnap = await getDocs(postQuery);
    // const posts = docSnap.docs.map((doc) => postToJSON(doc));

    const mypostQuery = query(
      collection(db, `/users/${uid}/posts`),
      orderBy("createdAt", "desc")
    );
    const myPostSnap = await getDocs(mypostQuery);
    const myPost = myPostSnap.docs.map((doc) => postToJSON(doc));
    const post = myPost.find((post: Post) => post.id === context.query.post);
    if (!post) {
      return {
        notFound: true,
      };
    }
    return {
      props: {
        expired,
        uid,
        email,
        myPost: post,
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
        email: "",
        myPost: [],
      },
    };
  }
};
export default function Page(props: {
  expired: boolean;
  uid: string;
  myPost: Post;
  email: string;
}) {
  const { uid, myPost, email, expired } = props;
  const router = useRouter();
  const { active, setActive } = useContext(PageContext) as PageProps;
  useEffect(() => {
    if (expired) {
      router.push("/");
      console.log("expired , pushed in post page");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);
  const InputRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // console.log(router.locale);
    InputRef.current?.focus();
  }, []);
  // useEffect(() => {
  //   if (InputRef.current?.textContent !== myPost.text) {
  //     alert("exit without saving");
  //   }
  // }, [myPost.text]);
  useEffect(() => {
    const input = InputRef.current;
    // return () => {
    window.onpopstate = () => {
      // alert("exit without saving");
      // if (input?.textContent !== myPost.text) {
      //   alert("exit without saving");
      //   history.pushState(
      //     router.asPath.split("?")[0],
      //     document.title,
      //     router.asPath.split("?")[0]
      //   );
      //   // history.pushState(null, document.title, router.asPath);
      // }
    };
    // };
  }, [myPost.text]);
  useEffect(() => {
    const input = InputRef.current;
    if (input?.textContent !== myPost.text) {
      history.pushState(null, document.title, window.location.href);
    }
    window.onpopstate = () => {
      // history.pushState(null, document.title, window.location.href);
      if (input?.textContent !== myPost.text) {
        window.history.go(1);
        if (window.location.hash === "#home") {
          alert("exit without saving");
        }
      }
    };
    if (input?.textContent !== myPost.text) {
      // history.pushState(null, document.title, location.hash);
      // history.pushState(
      //   router.asPath.split("?")[0],
      //   document.title,
      //   router.asPath.split("?")[0]
      // );
    } else {
      // router.back();
      // router.replace("/", undefined, { scroll: false });
    }
  }, [myPost.text]);

  return (
    <div className="user">
      <BackHeader
        onClick={() => {
          InputRef.current?.focus();
          router.back();
          alert("exit without saving");
          // if (InputRef.current?.textContent !== myPost.text) {
          //   alert("exit without saving");
          // } else {
          //   // router.back();
          // }
          // window.history.back();
          // router.push(`/#profile`, undefined, { shallow: true });
          // setActive("profile");
          // router.push(`/#profile`, undefined, { shallow: true });
          // if (router.asPath !== "/") {
          //   router.back();
          // } else if (active === "profile") {
          // }
        }}
      >
        {/* {active} */}
        {/* <h2>{uid}</h2> */}
        {/* <h2 className={s.title}>{myPost.id}</h2> */}
        {/* <h2 className={s.title}>Post</h2> */}
        <h2 className={s.title}>{router.query.edit ? "Edit" : "Post"}</h2>
        {/* <h2 className={s.title}>{uid}</h2> */}

        {/* <h2 className={s.title}>{active}</h2> */}

        {/* <h2 className={s.title}>{router.query.friends}</h2> */}
      </BackHeader>
      <Input
        style={{ cursor: router.query.edit ? "initial" : "default" }}
        element={InputRef}
        contentEditable={router.query.edit ? true : false}
      >
        {myPost.text}
      </Input>
      {/* <p>{router.query.edit}</p> */}
      {/* <p>User: {router.query.friends}</p> */}
    </div>
  );
}
