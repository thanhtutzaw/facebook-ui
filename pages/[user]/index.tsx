import { collectionGroup, getDocs } from "firebase/firestore";
import { GetServerSideProps } from "next";
import BackHeader from "../../components/Header/BackHeader";
import { db } from "../../lib/firebase";
import { getUserData } from "../../lib/firebaseAdmin";
import s from "../../styles/Home.module.scss";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
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
    console.log(allUsers);
    const user = allUsers.find((u) => u.id === context.query.user);
    // const userRecord = await getUserData(u.id)
    console.log(user);
    if (!user) {
      return {
        notFound: true,
      };
    }
    return {
      props: {
        user,
      },
    };
  } catch (error) {
    console.log("SSR Error " + error);
    return {
      props: {
        user: [],
      },
    };
  }
};
export default function Page({ user }: { user: any }) {
  return (
    <div className="user">
      <BackHeader>
        <h2 className={s.title}>
          {user.profile
            ? `${user.profile?.firstName} ${user.profile?.lastName}`
            : "Unknown User"}
        </h2>
      </BackHeader>
      <div className={s.userContent}>This page currently display testuser</div>
    </div>
  );
}
