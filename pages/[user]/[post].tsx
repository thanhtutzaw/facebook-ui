import { getAuth } from "firebase/auth";
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
import { useContext, useEffect, useRef, useState } from "react";
import BackHeader from "../../components/Header/BackHeader";
import Input from "../../components/Input";
import { PageContext, PageProps } from "../../context/PageContext";
import { app, db, postToJSON } from "../../lib/firebase";
import { verifyIdToken } from "../../lib/firebaseAdmin";
import { updatePost } from "../../lib/firestore/post";
import s from "../../styles/Home.module.scss";
import { Post, Props } from "../../types/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import error from "next/error";
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
  const [visibility, setVisibility] = useState<string>(myPost.visibility!);
  // useEffect(() => {
  //   if (expired) {
  //     router.push("/");
  //     console.log("expired , pushed in post page");
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [expired]);
  const InputRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    InputRef.current?.focus();
  }, []);
  // useEffect(() => {
  //   if (InputRef.current?.textContent !== myPost.text) {
  //     alert("exit without saving");
  //   }
  // }, [myPost.text]);
  useEffect(() => {}, [myPost.text]);

  // useEscape(() => {
  //   router.back();
  //   // if (InputRef.current?.textContent !== myPost.text) {
  //   // }
  // });
  // useEffect(() => {
  //   function handleEscape(e: KeyboardEvent) {
  //     if (!(e.key === "Escape")) return;
  //     // router.back();
  //     history.forward();
  //   }
  //   window.addEventListener("keyup", handleEscape);
  //   // return () => window.removeEventListener("keyup", handleEscape);
  // }, [router]);
  useEffect(() => {
    const input = InputRef.current;

    const handleBeforeUnload = (e: BeforeUnloadEvent | PopStateEvent) => {
      if (input?.textContent !== myPost.text && window.location.href !== "/") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    // const routeChangeStartHandler = () => {
    //   if (
    //     input?.textContent !== myPost.text &&
    //     !window.confirm(
    //       "You have unsaved changes. Do you want to leave the page?"
    //     )
    //   ) {
    //     nProgress.done();
    //     throw "routeChange aborted";
    //   }
    // };
    const handlePopState = (e: PopStateEvent) => {
      // if (
      //   input?.textContent !== myPost.text &&
      //   !confirm("Are you sure you want to leave this page?") &&
      //   e
      // ) {
      if (
        input?.textContent !== myPost.text &&
        !confirm("Are you sure you want to leave this page?")
      ) {
        // history.pushState(null, document.title, window.location.href);
        e.preventDefault();
        // history.forward();
        history.go(1);
        // history.back();
        // window.onbeforeunload = (e) => {
        //   e.preventDefault();
        //   e.returnValue = "";
        // };

        // history.forward();
        // if (e.state) {
        //   console.log(e.state);
        // } else {
        //   console.log("no e");
        // }
        // history.forward();
        // history.go(1);
        // if (e) {
        // } // history.forward();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    // window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // window.removeEventListener("popstate", handlePopState);
    };
    // if (input?.textContent !== myPost.text) {
    //   history.pushState(null, document.title, window.location.href);
    // }
    // window.onpopstate = () => {
    //   // history.pushState(null, document.title, window.location.href);
    //   if (input?.textContent !== myPost.text) {
    //     window.history.go(1);
    //     if (window.location.hash === "#home") {
    //       alert("exit without saving");
    //     }
    //   }
    // };
  }, []);
  useEffect(() => {
    router.beforePopState(({ as }) => {
      const currentPath = router.asPath;
      if (as !== currentPath && InputRef.current?.textContent !== myPost.text) {
        if (confirm("Changes you made may not be saved.")) {
          return true;
        } else {
          window.history.pushState(null, document.title, currentPath);
          return false;
        }
      }
      return true;
    });

    return () => {
      router.beforePopState(() => true);
    };
  }, [router]); // Add any state variables to dependencies array if needed.
  const auth = getAuth(app);
  const [newdata, setNewdata] = useState(myPost);
  // useEffect(() => {
  //   const input = InputRef?.current;
  //   if (!input || !input?.textContent) return;
  //   setNewdata({ ...myPost, text: input?.textContent });
  // }, [myPost]);

  return (
    <div className="user">
      <BackHeader
        onClick={() => {
          InputRef.current?.focus();
          router.back();
        }}
      >
        <h2 className={s.title}>{router.query.edit ? "Edit" : "Post"}</h2>
        {router.query.edit && (
          <button
            aria-label="update button"
            type="submit"
            className={s.submit}
            onClick={async () => {
              const uid = auth.currentUser?.uid;
              if (!InputRef.current?.textContent || !uid || !myPost) return;
              if (uid !== myPost.authorId) {
                throw new Error("Unauthorized !");
              }
              // if (
              //   InputRef.current?.textContent === myPost.text ||
              //   visibility === myPost.visibility
              // )
              //   return;
              // setNewdata({ ...myPost, text: InputRef.current?.textContent });
              if (
                visibility === myPost.visibility &&
                InputRef.current?.textContent === myPost.text
              )
                return;
              try {
                await updatePost(
                  uid,
                  InputRef.current.textContent,
                  myPost.id?.toString()!,
                  myPost,
                  visibility
                );
                router.replace("/", undefined, { scroll: false });
              } catch (error: any) {
                alert(error.message);
              }
            }}
          >
            Save
          </button>
        )}
      </BackHeader>
      <Input
        element={InputRef}
        contentEditable={router.query.edit ? true : false}
        style={{ cursor: router.query.edit ? "initial" : "default" }}
      >
        {myPost.text}
      </Input>
      <div className={s.footer}>
        <button tabIndex={-1} onClick={() => {}}>
          <FontAwesomeIcon icon={faPhotoFilm} />
        </button>
        <select
          defaultValue={visibility}
          tabIndex={-1}
          onChange={(e) => {
            setVisibility(e.target.value);
          }}
        >
          <option value="Pubilc" key="Public">
            Public
          </option>
          <option value="Friend" key="Friends">
            {/* <option disabled value="friends" key="Friends"> */}
            Friends
          </option>
          <option value="Onlyme" key="Only Me">
            {/* <option disabled value="onlyme" key="Only Me"> */}
            Only Me
          </option>
        </select>
      </div>
    </div>
  );
}
