import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { collection, getDocs, query, where } from "firebase/firestore";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import nookies from "nookies";
import BackHeader from "../../components/Header/BackHeader";
import { db, userToJSON } from "../../lib/firebase";
import { getUserData, verifyIdToken } from "../../lib/firebaseAdmin";
import s from "./index.module.scss";
import { useContext } from "react";
import { PageContext, PageProps } from "../../context/PageContext";
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
          // ...data,
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
  const { isPage, setisPage } = useContext(PageContext) as PageProps;
  return (
    <div className="user">
      <BackHeader>
        <h2>Messages</h2>
      </BackHeader>
      <div
        style={{
          marginTop: "65px",
          height: "calc(100vh - 65px)",
          backgroundColor: "#dadada",
        }}
        className={s.container}
      >
        {JSON.stringify(isPage)}
        {/* <button onClick={() => setisPage?.(isPage?.concat([9, 10]))}>
          change
        </button> */}
        {/* {JSON.stringify(acceptedFriends)} */}
        <ul>
          {acceptedFriends.map((friend) => (
            <li key={friend.id} aria-label="Go to Friends Profile">
              <Link href={`chat/${friend.id}`} key={friend.id}>
                <Image
                  className={s.profile}
                  alt={"name"}
                  width={50}
                  height={50}
                  src={
                    friend.author.photoURL ??
                    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                  }
                />
                <p className="textOverflow">
                  {friend.author.displayName ?? friend.id}
                </p>
                Active Now
              </Link>
            </li>
          ))}
        </ul>
        {/* {JSON.stringify(savedPosts)} */}
      </div>
    </div>
  );
}
