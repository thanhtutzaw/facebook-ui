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
import PhotoLayout from "../../components/Post/PhotoLayout";
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
  useEffect(() => {
    if (expired) {
      router.push("/");
      console.log("expired and pushed(in user/post.tsx)");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);
  // const text = myPost.text
  //   .replace(/<br\s*\/?>/g, "\n")
  //   .replaceAll("<div>", "")
  //   .replaceAll("</div>", "")
  //   .replaceAll("&nbsp;", " ");

  // if(myPost.text){
  const text = myPost.text
    ? myPost.text
        .replaceAll("</div>", "")
        .replace("<div>", "<br>")
        .replaceAll("<div><br><div>", "<br>")
        .replaceAll("<br><div>", "<br>")
    : "";
  // }
  // const text = myPost.text
  //   .replace("<div>", "")
  //   .replaceAll("</div><div>", "<br>");
  useEffect(() => {
    InputRef.current?.focus();
  }, []);
  useEffect(() => {
    const input = InputRef.current;
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
    });

    return () => {
      router.beforePopState(() => true);
    };
  }, [myPost.visibility, router, value, visibility]); // Add any state variables to dependencies array if needed.
  const auth = getAuth(app);
  const [client, setClient] = useState(false);
  useEffect(() => {
    setClient(true);
  }, []);
  const [loading, setLoading] = useState(false);
  return (
    <div className="user">
      <BackHeader
        onClick={() => {
          InputRef.current?.focus();
          router.back();
        }}
      >
        {/* <h2 className={s.title}>{router.query.edit ? "Edit" : "Post"}</h2> */}
        <h2 className={s.title}>{expired ? "true" : "false"}</h2>
        {router.query.edit && (
          <button
            tabIndex={1}
            aria-label="update button"
            type="submit"
            disabled={loading}
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
              setLoading(true);
              try {
                await updatePost(
                  uid,
                  InputRef.current.innerHTML
                    .replaceAll("<div>", "")
                    .replaceAll("</div>", "")
                    .replace("<div>", "<br>")
                    .replaceAll("<div><br><div>", "<br>")
                    .replaceAll("<br><div>", "<br>")
                    .replace("</div>", "")
                    .replaceAll(
                      /(?:https?|ftp):\/\/[\n\S]+/g,
                      (url) => `<a href="${url}">${url}</a>`
                    ),
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
            {loading ? "Saving..." : "Save"}
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

      <PhotoLayout
        uid={uid}
        myPost={myPost}
        edit={router.query.edit ? true : false}
        files={myPost.media}
        // files={[
        //   { id: 1, name: "../1.gif" },
        //   { id: 2, name: "../2.gif" },
        //   { id: 3, name: "../3.jpg" },
        //   { id: 4, name: "../4.png" },
        // ]}
      />
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
            Friends
          </option>
          <option value="Onlyme" key="Only Me">
            Only Me
          </option>
        </select>
      </div>
    </div>
  );
}
