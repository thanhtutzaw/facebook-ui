import { UserRecord } from "firebase-admin/lib/auth/user-record";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import BackHeader from "../../components/Header/BackHeader";
import s from "./index.module.scss";
import { db, postToJSON, userToJSON } from "../../lib/firebase";
import { getUserData, verifyIdToken } from "../../lib/firebaseAdmin";
import { Post, SavedPost } from "../../types/interfaces";
// import console, { profile } from "console";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import nookies from "nookies";
import Link from "next/link";
import Image from "next/image";
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;

    const { uid } = token;
    const allUsersQuery = query(
      collection(db, `users`),
      where("__name__", "!=", uid)
    );
    const allUsersSnap = await getDocs(allUsersQuery);
    const acceptedFriends = await Promise.all(
      allUsersSnap.docs.map(async (doc) => {
        const data = doc.data();
        const account = (await getUserData(doc.id as string))! as UserRecord;
        const accountJSON = userToJSON(account) as UserRecord;
        return {
          id: doc.id,
          ...data,
          author: {
            ...accountJSON,
          },
        };
      })
    );
    return {
      props: {
        acceptedFriends,
      },
    };
  } catch (error) {
    console.log("SSR Error " + error);
    return {
      props: {
        acceptedFriends: [],
      },
    };
  }
};

export default function Page(props: { acceptedFriends: any[] }) {
  const { acceptedFriends } = props;
  return (
    <div className="user">
      <BackHeader>
        <h2>My Friends</h2>
      </BackHeader>
      <div
        style={{
          marginTop: "65px",
          height: "calc(100vh - 65px)",
          backgroundColor: "#dadada",
        }}
        className={s.container}
      >
        <ul>
          {acceptedFriends.map((friend) => (
            <li key={friend.id} aria-label="Go to Friends Profile">
              <Link href={friend.id} key={friend.id}>
                <Image
                  className={s.profile}
                  alt={"name"}
                  width={80}
                  height={80}
                  src={
                    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                  }
                />
                <p>{friend.author.displayName ?? friend.id}</p>
              </Link>
            </li>
          ))}
        </ul>
        {/* {JSON.stringify(savedPosts)} */}
      </div>
    </div>
  );
}
