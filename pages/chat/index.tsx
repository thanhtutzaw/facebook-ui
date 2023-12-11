import { checkPhotoURL } from "@/lib/firestore/profile";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { getDocs, query, where } from "firebase/firestore";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import nookies from "nookies";
import BackHeader from "../../components/Header/BackHeader";
import { collectionBasePath, userToJSON } from "../../lib/firebase";
import { getUserData, verifyIdToken } from "../../lib/firebaseAdmin";
import s from "./index.module.scss";
import { TAcceptedFriends } from "@/types/interfaces";
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;
    const { uid } = token;
    const allUsersQuery = query(
      collectionBasePath,
      where("__name__", "!=", uid)
    );
    const allUsersSnap = await getDocs(allUsersQuery);
    const acceptedFriends = await Promise.all(
      allUsersSnap.docs.map(async (doc) => {
        const account = (await getUserData(doc.id as string))! as UserRecord;
        const accountJSON = userToJSON(account) as UserRecord;
        return {
          id: doc.id,
          author: {
            ...accountJSON,
          },
        } as TAcceptedFriends;
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

export default function Page(props: { acceptedFriends: TAcceptedFriends[] }) {
  const { acceptedFriends } = props;
  return (
    <div className="user">
      <BackHeader>
        <h2>Messages</h2>
      </BackHeader>
      <div
        className={`h-[calc(100vh-65px)] mt-[65px] bg-[#dadada] ${s.container}`}
      >
        <ul>
          {acceptedFriends.map((friend) => (
            <li key={friend.id} aria-label="Go to Friends Profile">
              <Link href={`chat/${friend.id}`}>
                <Image
                  className={`rounded-full h-[50px] bg-avatarBg`}
                  alt={"name"}
                  width={50}
                  height={50}
                  src={checkPhotoURL(friend?.author?.photoURL)}
                />
                <p className="textOverflow">
                  {friend?.author?.displayName ?? friend.id}
                </p>
                <p style={{ fontSize: "16px" }}>Active Now</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
