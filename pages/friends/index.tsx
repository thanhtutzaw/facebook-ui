import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { GetServerSideProps } from "next";
import BackHeader from "../../components/Header/BackHeader";
import { db, userToJSON } from "../../lib/firebase";
import { getUserData, verifyIdToken } from "../../lib/firebaseAdmin";
import s from "./index.module.scss";
// import console, { profile } from "console";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import Image from "next/image";
import Link from "next/link";
import nookies from "nookies";
import { unFriend } from "../../lib/firestore/friends";
import { useRouter } from "next/router";
import {useQueryClient} from '@tanstack/react-query'
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;

    const { uid } = token;
    const myFriendsQuery = query(
      collection(db, `users/${uid}/friends`),
      where("status", "==", "friend"),
      orderBy("updatedAt", "desc")
    );
    const myFriendsSnap = await getDocs(myFriendsQuery);
    const acceptedFriends = await Promise.all(
      myFriendsSnap.docs.map(async (doc) => {
        const account = (await getUserData(doc.id as string))! as UserRecord;
        const accountJSON = userToJSON(account) as UserRecord;
        return {
          id: doc.id,
          author: {
            ...accountJSON,
          },
        };
      })
    );
    return {
      props: {
        uid,
        acceptedFriends,
      },
    };
  } catch (error) {
    console.log("SSR Error " + error);
    return {
      props: {
        uid: null,
        acceptedFriends: [],
      },
    };
  }
};

export default function Page(props: { acceptedFriends: any[]; uid: string }) {
  const { acceptedFriends, uid } = props;
  const allFriendsCount = acceptedFriends.length;
  const router = useRouter();
  const queryClient = useQueryClient();
  return (
    <div className="user">
      <BackHeader>
        <h2>Friends {allFriendsCount > 0 && allFriendsCount}</h2>
      </BackHeader>
      <div
        style={{
          marginTop: "65px",
          height: "calc(100vh - 65px)",
          // backgroundColor: "#dadada",
        }}
        className={s.container}
      >
        {allFriendsCount > 0 ? (
          <ul>
            {acceptedFriends.map((friend) => (
              <li key={friend.id} aria-label="Go to Friends Profile">
                <Link href={friend.id} key={friend.id}>
                  <Image
                    className={s.profile}
                    alt={"name"}
                    width={100}
                    height={100}
                    src={
                      friend.author.photoURL ??
                      "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                    }
                  />
                  <p>{friend.author.displayName ?? friend.id}</p>
                </Link>
                <button
                  onClick={async () => {
                    try {
                      await unFriend(uid, friend);
                      router.replace(router.asPath, undefined, {
                        scroll: false,
                      });
                      queryClient.refetchQueries(["allUsers"]);
                      queryClient.invalidateQueries(["allUsers"]);
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                >
                  Un-Friend
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: "center", padding: "1rem" }}>Empty Friends</p>
        )}

        {/* {JSON.stringify(acceptFriends.length)} */}

        {/* {JSON.stringify(savedPosts)} */}
      </div>
    </div>
  );
}
