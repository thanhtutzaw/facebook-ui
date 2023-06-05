import { collectionGroup, getDocs } from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import BackHeader from "../../components/Header/BackHeader";
import { db } from "../../lib/firebase";
import { getUserData, verifyIdToken } from "../../lib/firebaseAdmin";
import s from "../../styles/Home.module.scss";
import { Props } from "../../types/interfaces";
export const getServerSideProps: GetServerSideProps = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    const token = await verifyIdToken(cookies.token);
    const { email, uid } = token;
    const allUsersQuery = collectionGroup(db, `users`);
    const allUsersSnap = await getDocs(allUsersQuery);
    const allUsers = allUsersSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        ...getUserData(doc.id),
      };
    });
    const user = allUsers.find((u) => u.id === context.query.user);
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
        <h2 className={s.title}>{user.id}</h2>
      </BackHeader>
      <div className={s.userContent}>This page currently display testuser</div>
    </div>
  );
}
