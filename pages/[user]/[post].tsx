import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import {
  collection,
  collectionGroup,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import router, { useRouter } from "next/router";
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
import { text } from "@fortawesome/fontawesome-svg-core";
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
  const InputRef = useRef<HTMLDivElement>(null);

  const [value, setvalue] = useState("");

  // const text = myPost.text
  //   .replace(/<br\s*\/?>/g, "\n")
  //   .replaceAll("<div>", "")
  //   .replaceAll("</div>", "")
  //   .replaceAll("&nbsp;", " ");

  const text = myPost.text
    .replaceAll("</div>", "")
    .replace("<div>", "<br>")
    .replaceAll("<div><br><div>", "<br>")
    .replaceAll("<br><div>", "<br>");
  // const text = myPost.text
  //   .replace("<div>", "")
  //   .replaceAll("</div><div>", "<br>");

  // useEffect(() => {
  //   if (expired) {
  //     router.push("/");
  //     console.log("expired , pushed in post page");
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [expired]);
  useEffect(() => {
    InputRef.current?.focus();
  }, []);
  useEffect(() => {
    const input = InputRef.current;
    // console.log(myPost.text !== text);
    setvalue(
      InputRef.current?.innerHTML
        .replaceAll("<div>", "")
        .replaceAll("</div>", "")
        .replace("<div>", "<br>")
        .replaceAll("<div><br><div>", "<br>")
        .replaceAll("<br><div>", "<br>")
        .replace("</div>", "")!
      // .replaceAll("</div>", "")
      // .replace("<div>", "<br>")
      // .replaceAll("<div><br><div>", "<br>")
      // .replaceAll("<br><div>", "<br>")!
    );
    // console.log(value === text);

    // console.log(
    //   myPost.text
    //     .replaceAll("</div>", "")
    //     .replace("<div>", "<br>")
    //     .replaceAll("<div><br><div>", "<br>")
    //     .replaceAll("<br><div>", "<br>")
    // );
    // console.log(
    //   myPost.text
    //     .replaceAll("<div>", "")
    //     .replaceAll("</div>", "")
    //     .replace("<div>", "<br>")
    //     .replaceAll("<div><br><div>", "<br>")
    //     .replaceAll("<br><div>", "<br>")
    //     .replace("</div>", "")
    // );
    const handleBeforeUnload = (e: BeforeUnloadEvent | PopStateEvent) => {
      if (
        value ===
          input?.innerHTML
            .replaceAll("<div>", "")
            .replaceAll("</div>", "")
            .replace("<div>", "<br>")
            .replaceAll("<div><br><div>", "<br>")
            .replaceAll("<br><div>", "<br>")
            .replace("</div>", "") ||
        (visibility !== myPost.visibility && window.location.href !== "/")
      ) {
        e.preventDefault();
        e.returnValue = "";
      }
      // const handleBeforeUnload = (e: BeforeUnloadEvent | PopStateEvent) => {
      //   if (
      //     input?.innerHTML.replace(/\n/g, "<br>").replaceAll("&nbsp;", " ") !==
      //       myPost.text ||
      //     (visibility !== myPost.visibility && window.location.href !== "/")
      //   ) {
      //     e.preventDefault();
      //     e.returnValue = "";
      //   }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [myPost.text, myPost.visibility, text, value, visibility]);
  useEffect(() => {
    router.beforePopState(({ as }) => {
      const currentPath = router.asPath;

      if (
        (as !== currentPath &&
          value ===
            InputRef.current?.innerHTML
              .replaceAll("<div>", "")
              .replaceAll("</div>", "")
              .replace("<div>", "<br>")
              .replaceAll("<div><br><div>", "<br>")
              .replaceAll("<br><div>", "<br>")
              .replace("</div>", "")) ||
        visibility !== myPost.visibility
      ) {
        if (confirm("Changes you made may not be saved.")) {
          return true;
        } else {
          window.history.pushState(null, document.title, currentPath);
          return false;
        }
      }
      return true;
      // if (
      //   (as !== currentPath &&
      //     InputRef.current?.innerHTML
      //       .replace(/\n/g, "<br>")
      //       .replaceAll("&nbsp;", " ") !== myPost.text) ||
      //   visibility !== myPost.visibility
      // ) {
      //   if (confirm("Changes you made may not be saved.")) {
      //     return true;
      //   } else {
      //     window.history.pushState(null, document.title, currentPath);
      //     return false;
      //   }
      // }
      // return true;
    });

    return () => {
      router.beforePopState(() => true);
    };
  }, [myPost.visibility, router, value, visibility]); // Add any state variables to dependencies array if needed.
  const auth = getAuth(app);
  const [newdata, setNewdata] = useState(myPost);
  // useEffect(() => {
  //   const input = InputRef?.current;
  //   if (!input || !input?.innerHTML) return;
  //   setNewdata({ ...myPost, text: input?.innerHTML });
  // }, [myPost]);
  const [client, setClient] = useState(false);
  useEffect(() => {
    setClient(true);
  }, []);

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
            tabIndex={1}
            aria-label="update button"
            type="submit"
            className={s.submit}
            onClick={async () => {
              const uid = auth.currentUser?.uid;
              if (!InputRef.current?.innerHTML || !uid || !myPost) return;
              if (uid !== myPost.authorId) {
                throw new Error("Unauthorized !");
              }
              if (
                visibility === myPost.visibility &&
                InputRef.current?.innerHTML
                  .replace(/\n/g, "<br>")
                  .replaceAll("&nbsp;", " ") === myPost.text
              )
                return;
              try {
                await updatePost(
                  uid,
                  InputRef.current.innerHTML
                    .replaceAll("<div>", "")
                    .replaceAll("</div>", "")
                    .replace("<div>", "<br>")
                    .replaceAll("<div><br><div>", "<br>")
                    .replaceAll("<br><div>", "<br>")
                    .replace("</div>", ""),
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
        role="textbox"
        element={InputRef}
        contentEditable={router.query.edit ? true : false}
        style={{
          cursor: router.query.edit ? "initial" : "default",
          whiteSpace: "pre-line",
        }}
        onInput={(e) => {
          setvalue(
            e.currentTarget.innerHTML
              .replaceAll("<div>", "")
              .replaceAll("</div>", "")
              .replace("<div>", "<br>")
              .replaceAll("<div><br><div>", "<br>")
              .replaceAll("<br><div>", "<br>")
              .replace("</div>", "")
          );
        }}
        dangerouslySetInnerHTML={{ __html: client ? text : "" }}
      ></Input>
      <div className={s.footer}>
        <button tabIndex={-1} onClick={() => {}}>
          <FontAwesomeIcon icon={faPhotoFilm} />
        </button>
        <select
          disabled={router.query.edit ? false : true}
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
