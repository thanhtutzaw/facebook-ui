import { UserRecord } from "firebase-admin/lib/auth/user-record";
import {
  DocumentData,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
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
import { getUserData } from "../../lib/firebaseAdmin";
import Image from "next/image";
import { PostList } from "../../components/Sections/Home/PostList";
import { Post as PostType, account } from "../../types/interfaces";
import { useRouter } from "next/router";
import { useContext } from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import { getAuth } from "firebase/auth";
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const uid = context.query.user!;

    // const user = await fethUserDoc(uid);
    const userQuery = doc(db, `users/${uid}`);
    const user = await getDoc(userQuery);
    const mypostQuery = query(
      collection(db, `/users/${uid}/posts`),
      where("visibility", "in", ["Friend", "Public"]),
      orderBy("createdAt", "desc")
    );
    const account = (await getUserData(uid as string))! as UserRecord;
    const accountJSON = userToJSON(account);
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
          account: accountJSON ?? null,
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
        account: null,
        user: [],
        myPost: [],
      },
    };
  }
};
export default function UserProfile({
  account,
  user,
  myPost,
}: {
  account: UserRecord;
  user: { profile: account["profile"] } & account & UserRecord;
  myPost: PostType[];
}) {
  const { profile } = user;
  const router = useRouter();
  const { uid, setview } = useContext(PageContext) as PageProps;
  const auth = getAuth(app);
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
                name: `${account?.displayName ?? "Unknown User"}'s profile`,
              });
            }}
            priority={false}
            className={s.profile}
            width={500}
            height={170}
            style={{ objectFit: "cover", width: "120px", height: "120px" }}
            alt={`${account?.displayName ?? "Unknown User"}'s profile`}
            src={
              user.photoURL ??
              "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
            }
          />
          {/* {JSON.stringify(account)} */}
          <h3 style={{ marginBottom: "18px" }}>
            {account?.displayName ?? "Unknown User"}
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
          {auth.currentUser?.uid !== account.uid && (
            <button
              onClick={() => {
                router.push(`/chat/${account?.uid}`);
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
