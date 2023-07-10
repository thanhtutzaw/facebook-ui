import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import BackHeader from "../../components/Header/BackHeader";
import { db, postToJSON } from "../../lib/firebase";
import { getUserData } from "../../lib/firebaseAdmin";
import styles from "../../styles/Home.module.scss";
import s from "../../components/Sections/Profile/index.module.scss";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
// import ErrorPage from "../_error";
import ErrorPage from "next/error";
import Post from "../../components/Post";
import { Post as PostType } from "../../types/interfaces";
import { Footer } from "../../components/Post/Footer";
import Image from "next/image";
import email from "../login/email";
import { PostList } from "../../components/Sections/Home/PostList";
import { profile } from "console";
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const userQuery = doc(db, `users/${context.query.user}`);
    const currentUser = await getDoc(userQuery);
    console.log(currentUser.exists());

    // const currentUser2 = await Promise.all(
    //   currentUser.map(async (doc) => {
    //     const data = doc.data();
    //     // const author = (await getUserData(doc.id)) as UserRecord;
    //     return {
    //       id: doc.id,
    //       ...data,
    //       // ...(author ?? null),
    //       // displayName: author.displayName!,
    //       // photoURL: author.photoURL!,
    //       // ...getUserData(doc.id),
    //     };
    //   })
    // );
    // context.res.
    const allUsersQuery = collectionGroup(db, `users`);
    const allUsersSnap = await getDocs(allUsersQuery);
    const allUsers = await Promise.all(
      allUsersSnap.docs.map(async (doc) => {
        const data = doc.data();
        // const author = (await getUserData(doc.id)) as UserRecord;
        return {
          id: doc.id,
          ...data,
          // ...(author ?? null),
          // displayName: author.displayName!,
          // photoURL: author.photoURL!,
          // ...getUserData(doc.id),
        };
      })
    );
    // const user = allUsers.find((u) => u.id === context.query.user);
    const userId = context.query.user;
    // const userId = context.query.post;
    const mypostQuery = query(
      collection(db, `/users/${userId}/posts`),
      orderBy("createdAt", "desc")
    );
    const myPostSnap = await getDocs(mypostQuery);
    // getUserData;

    const myPost = await Promise.all(
      myPostSnap.docs.map(async (doc) => {
        const post = await postToJSON(doc);
        const user = (await getUserData(post.authorId)) as UserRecord;
        const authorName = user?.displayName ?? "Unknown User";
        return {
          ...post,
          author: { name: authorName },
        };
      })
    );
    // if (!user) {
    //   return {
    //     notFound: true,
    //   };
    // }
    console.log(currentUser.data());
    if (currentUser.exists()) {
      return {
        props: {
          user: currentUser.data(),
          myPost,
        },
      };
    } else {
      return {
        notFound: true,
      };
    }
  } catch (error) {
    console.log("SSR Error " + error);
    return {
      props: {
        user: [],
        myPost: [],
      },
    };
  }
};
export default function Page({
  user,
  myPost,
}: {
  user: any;
  myPost: PostType[];
}) {
  const { profile } = user;
  return (
    <div className="user">
      <BackHeader />
      <div
        style={{
          marginTop: "65px",
          height: "calc(100vh - 65px)",
          backgroundColor: "#dadada",
        }}
        className={s.container}
      >
        <div className={`${s.info}`}>
          <Image
            priority={false}
            className={s.profile}
            width={500}
            height={170}
            style={{ objectFit: "cover", width: "120px", height: "120px" }}
            alt={`${profile?.firstName ?? "Unknown"} ${
              profile?.lastName ?? ""
            }'s profile`}
            src={
              profile?.photoURL ??
              "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
            }
          />
          <h3 style={{ marginBottom: "18px" }}>
            {profile
              ? `${profile?.firstName} ${profile?.lastName}`
              : "Unknown User"}
          </h3>
          <p
            style={{
              color: profile?.bio === "" ? "gray" : "initial",
              marginTop: "0",
            }}
            className={s.bio}
          >
            {profile?.bio === "" ? "No Bio Yet" : profile?.bio}
          </p>
        </div>
        <PostList tabIndex={1} posts={myPost} profile={profile} />
      </div>
    </div>
  );
}
