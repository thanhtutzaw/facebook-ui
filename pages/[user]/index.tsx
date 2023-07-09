import {
  collection,
  collectionGroup,
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
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const allUsersQuery = collectionGroup(db, `users`);
    const allUsersSnap = await getDocs(allUsersQuery);
    const allUsers = await Promise.all(
      allUsersSnap.docs.map(async (doc) => {
        const data = doc.data();
        const author = (await getUserData(doc.id)) as UserRecord;
        // const { displayName:string, photoURL:string } = author;
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
    // console.log(allUsers);
    const user = allUsers.find((u) => u.id === context.query.user);
    // const userRecord = await getUserData(u.id)
    // console.log(user);
    const mypostQuery = query(
      collection(db, `/users/${user?.id}/posts`),
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
    if (!user) {
      return {
        notFound: true,
      };
    }
    return {
      props: {
        user,
        myPost,
      },
    };
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
        {/* <h2 className={s.title}>
          {user.profile
            ? `${user.profile?.firstName} ${user.profile?.lastName}`
            : "Unknown User"}
        </h2> */}
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
              user.photoURL
                ? user.photoURL
                : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
            }
          />
          <h3 style={{ marginBottom: "18px" }}>
            {profile
              ? `${profile?.firstName} ${profile?.lastName}`
              : "Unknown User"}
          </h3>
          {/* <h3 style={{ marginBottom: "18px" }}>
          {email === "testuser@gmail.com"
            ? "Peter 1"
            : `${profile?.firstName ?? "Unknown"} ${profile?.lastName ?? ""}`}
        </h3> */}
          <p
            style={{
              color: profile?.bio === "" ? "gray" : "initial",
              marginTop: "0",
            }}
            className={s.bio}
          >
            {/* Listen I didn&apos;t kill Mysterio. The drones did! */}
            {/* {edit
            ? newProfile.bio
            : profile?.bio === ""
            ? "No Bio Yet"
            : profile?.bio ??
              "Listen I didn&apos;t kill Mysterio. The drones did!"} */}
            {profile?.bio === "" ? "No Bio Yet" : profile?.bio}
          </p>
        </div>
        <PostList tabIndex={1} posts={myPost} profile={profile} />
        {/* {myPost?.map((post: PostType) => (
          // <Post key={post.id} post={post} tabIndex={1} />
          <div key={post.id}>
            <p>{post.text}</p>
            <Footer />
          </div>
        ))} */}
      </div>
    </div>
  );
}
