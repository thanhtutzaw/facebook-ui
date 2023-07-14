import { UserRecord } from "firebase-admin/lib/auth/user-record";
import {
  DocumentData,
  Unsubscribe,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import BackHeader from "../../components/Header/BackHeader";
import s from "../../components/Sections/Profile/index.module.scss";
import {
  app,
  db,
  fethUserDoc,
  postToJSON,
  userToJSON,
} from "../../lib/firebase";
import { getUserData, verifyIdToken } from "../../lib/firebaseAdmin";
import Image from "next/image";
import { PostList } from "../../components/Sections/Home/PostList";
import { Post as PostType, SavedPost, account } from "../../types/interfaces";
import { useRouter } from "next/router";
import { profile } from "console";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import nookies from "nookies";
import { unSavePost } from "../../lib/firestore/savedPost";
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;

    const { uid } = token;

    // const user = await fethUserDoc(uid);
    // const mypostQuery = query(
    //   collection(db, `/users/${uid}/posts`),
    //   orderBy("createdAt", "desc")
    // );
    const savedPostQuery = doc(db, `/users/${uid}`);
    const savedPostSnap = await getDoc(savedPostQuery);
    // const profileData = profileSnap.data()!;
    // const profile = profileData.profile as account["profile"];
    // const savedPostQuery = collection(db, `/users/${uid}/savedPosts`);
    //   unsub = onSnapshot(savedPostQuery, async (snapshot) => {
    //     const post = snapshot.docs.map((doc) => {
    //       const data = doc.data() as SavedPost;
    //       return { ...data };
    //     });
    //     setsavedPost(post);
    //     // setLoading(false);
    //   });
    // const savedPostSnap = await getDocs(savedPostQuery);
    const savedPosts = savedPostSnap.data()!.savedPosts;
    // const savedPost = await Promise.all(
    //   savedPostSnap.docs.map(async (doc) => {
    //     // const post = await postToJSON(doc);
    //     // const UserRecord = (await getUserData(post.authorId)) as UserRecord;
    //     // const userJSON = userToJSON(UserRecord);
    //     const data = doc.data() as SavedPost;
    //     // console.log(data);
    //     // return { ...data };
    //     return data;
    //   })
    // );
    // if (user.exists()) {
    //   return {
    //     props: {
    //       // user: user.data(),
    //       uid,
    //       myPost,
    //     },
    //   };
    // } else {
    //   return {
    //     notFound: true,
    //   };
    // }
    return {
      props: {
        savedPosts,
        uid,
      },
    };
  } catch (error) {
    console.log("SSR Error " + error);
    return {
      props: {
        savedPost: [],
        uid: "",
      },
    };
  }
};

export default function SavedPost(props: {
  savedPosts: SavedPost[];
  uid: string;
}) {
  const { savedPosts, uid } = props;
  const router = useRouter();
  // const [savedPost, setsavedPost] = useState<SavedPost[] | []>([]);
  const auth = getAuth(app);
  // const uid = auth?.currentUser?.uid ?? "";
  // useEffect(() => {
  //   // setLoading(true);
  //   if (!uid) return;
  //   let unsub: Unsubscribe;
  //   const savedPostQuery = collection(db, `/users/${uid}/savedPost`);
  //   unsub = onSnapshot(savedPostQuery, async (snapshot) => {
  //     const post = snapshot.docs.map((doc) => {
  //       const data = doc.data() as SavedPost;
  //       return { ...data };
  //     });
  //     setsavedPost(post);
  //     // setLoading(false);
  //   });
  //   return () => {
  //     unsub;
  //   };
  // }, [uid]);
  return (
    <div className="user">
      <BackHeader>
        <h2>Saved Post</h2>
      </BackHeader>
      <div
        style={{
          marginTop: "65px",
          height: "calc(100vh - 65px)",
          backgroundColor: "#dadada",
        }}
        className={s.container}
      >
        {/* {JSON.stringify(savedPosts)} */}
        <ol>
          {savedPosts.map((s) => (
            <li key={s.id}>
              saved author {s.authorId}&apos;s postid {s.postId}
              <button
                onClick={async (e) => {
                  // await unSavePost(s.id?.toString());
                  // alert(s.id?.toString());
                  const unsavedPost = savedPosts.filter(
                    (savepost) => savepost.postId !== s.postId
                  );
                  // console.log(newArray);
                  await unSavePost(unsavedPost)
                  router.push("/saved", undefined, { scroll: false });
                }}
              >
                Unsave
              </button>
            </li>
          ))}
        </ol>
        {/* <div className={`${s.info}`}>
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
              user.photoURL ??
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
            {profile?.bio === "" || !profile ? "No Bio Yet" : profile?.bio}
          </p>
        </div> */}
        {/* <PostList tabIndex={1} posts={myPost} profile={profile} /> */}
      </div>
    </div>
  );
}
