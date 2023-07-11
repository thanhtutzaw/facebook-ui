import { UserRecord } from "firebase-admin/lib/auth/user-record";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import BackHeader from "../../components/Header/BackHeader";
import s from "../../components/Sections/Profile/index.module.scss";
import { db, fethUserDoc, postToJSON, userToJSON } from "../../lib/firebase";
import { getUserData } from "../../lib/firebaseAdmin";
import Image from "next/image";
import { PostList } from "../../components/Sections/Home/PostList";
import { Post as PostType } from "../../types/interfaces";
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const uid = context.query.user!;

    // const user = await fethUserDoc(uid);
    // console.log(user);
    const profileQuery = doc(db, `/users/${uid}`);
    const user = await getDoc(profileQuery);
    const mypostQuery = query(
      collection(db, `/users/${uid}/posts`),
      orderBy("createdAt", "desc")
    );
    const myPostSnap = await getDocs(mypostQuery);
    const myPost = await Promise.all(
      myPostSnap.docs.map(async (doc) => {
        const post = await postToJSON(doc);
        const UserRecord = (await getUserData(post.authorId)) as UserRecord;
        const userJSON = userToJSON(UserRecord);
        return {
          ...post,
          author: {
            ...userJSON,
          },
        };
      })
    );
    if (user.exists()) {
      return {
        props: {
          user: user.data(),
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
export default function User({
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
