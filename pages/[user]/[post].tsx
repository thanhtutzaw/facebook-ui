import { useRouter } from "next/router";
import BackHeader from "../../components/Header/BackHeader";
import s from "../../styles/Home.module.scss";
import { db, postToJSON } from "../../lib/firebase";
import {
  collection,
  collectionGroup,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { verifyIdToken } from "../../lib/firebaseAdmin";
import { Post, Props } from "../../types/interfaces";
import nookies from "nookies";
import { useContext, useEffect } from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import Input from "../../components/Input";
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

  return (
    <div className="user">
      <BackHeader
        onClick={() => {
          router.back();
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
        <h2 className={s.title}>{email}</h2>
        <h2 className={s.title}>{uid}</h2>

        {/* <h2 className={s.title}>{active}</h2> */}

        {/* <h2 className={s.title}>{router.query.friends}</h2> */}
      </BackHeader>
      <Input>{myPost.text}</Input>
      {/* <p>User: {router.query.friends}</p> */}
    </div>
  );
}
