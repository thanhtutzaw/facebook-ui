import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import {
  DocumentData,
  DocumentSnapshot,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import BackHeader from "../../components/Header/BackHeader";
import { PostList } from "../../components/Sections/Home/PostList";
import s from "../../components/Sections/Profile/index.module.scss";
import { PageContext, PageProps } from "../../context/PageContext";
import { app, db, getProfileByUID, postToJSON } from "../../lib/firebase";
import { Post as PostType, account } from "../../types/interfaces";
import nookies from "nookies";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { verifyIdToken } from "../../lib/firebaseAdmin";
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const uid = context.query.user!;
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;
    // const user = await fethUserDoc(uid);
    const userQuery = doc(db, `users/${uid}`);
    const user = await getDoc(userQuery);
    const userExist = user.exists();
    const mypostQuery = query(
      collection(db, `/users/${uid}/posts`),
      where("visibility", "in", ["Friend", "Public"]),
      orderBy("createdAt", "desc")
    );
    // const account = (await getUserData(uid as string))! as UserRecord;
    // const accountJSON = userToJSON(account);
    // const accountProfile = await getProfileByUID(uid as string)
    const myPostSnap = await getDocs(mypostQuery);
    const myPost = await Promise.all(
      myPostSnap.docs.map(async (doc) => {
        const post = await postToJSON(doc);
        // const UserRecord = (await getUserData(post.authorId)) as UserRecord;
        // const userJSON = userToJSON(UserRecord);
        const profile = await getProfileByUID(post.authorId);

        return {
          ...post,
          author: {
            ...profile,
          },
        };
      })
    );
    const newPosts = await Promise.all(
      myPost.map(async (p) => {
        if (p.sharePost) {
          const postDoc = doc(
            db,
            `users/${p.sharePost?.author}/posts/${p.sharePost?.id}`
          );
          const posts = await getDoc(postDoc);
          if (posts.exists()) {
            const post = await postToJSON(
              posts as DocumentSnapshot<DocumentData>
            );
            const profile = await getProfileByUID(post.authorId);
            const sharePost = {
              ...post,
              author: {
                ...profile,
              },
            };
            return {
              ...p,
              sharePost: { ...p.sharePost, post: { ...sharePost } },
            };
          } else {
            return {
              ...p,
              sharePost: { ...p.sharePost, post: null },
            };
          }
        }
        return {
          ...p,
        };
      })
    );

    if (userExist) {
      return {
        props: {
          token,
          // account: accountProfile ?? null,
          user: user.data(),
          myPost: newPosts,
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
        token: null,
        // account: null,
        user: [],
        myPost: [],
      },
    };
  }
};
export default function UserProfile({
  token,
  user,
  myPost,
}: {
  token: DecodedIdToken;
  // account: account["profile"];
  user: { profile: account["profile"] } & account & UserRecord;
  myPost: PostType[];
}) {
  const { profile } = user;
  const router = useRouter();
  const { setview } = useContext(PageContext) as PageProps;
  const auth = getAuth(app);
  const userName = `${profile.firstName ?? "Unknow"} ${
    profile.lastName ?? "User"
  }`;
  // const [authUser, setauthUser] = useState<User | null>(null);
  // useEffect(() => {
  //   const auth = getAuth(app);
  //   onAuthStateChanged(auth, (user) => {
  //     setauthUser(user);
  //   });
  // }, []);

  return (
    <div className="user">
      <BackHeader
        onClick={() => {
          router.push("/");
        }}
      />
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
            onClick={() => {
              setview?.({
                src: user.photoURL
                  ? user.photoURL
                  : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
                name: `${userName}'s profile`,
              });
            }}
            priority={false}
            className={s.profile}
            width={500}
            height={170}
            style={{ objectFit: "cover", width: "120px", height: "120px" }}
            alt={`${userName}'s profile`}
            src={
              user.photoURL ??
              "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
            }
          />
          {/* {JSON.stringify(account)} */}
          {/* <h1>{router.query.user}</h1> <br /> */}
          {/* {auth.currentUser?.uid} */}
          {/* {uid} */}
          <h3 style={{ marginBottom: "18px" }}>
            {userName}
            {/* {profile
              ? `${profile?.firstName} ${profile?.lastName}`
              : "Unknown User"} */}
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
          {token.uid !== router.query.user && (
            <button
              onClick={() => {
                router.push(`/chat/${router.query.user}`);
              }}
              className={s.editToggle}
            >
              Send Message
            </button>
          )}
        </div>
        <PostList tabIndex={1} posts={myPost} profile={profile} />
      </div>
    </div>
  );
}
