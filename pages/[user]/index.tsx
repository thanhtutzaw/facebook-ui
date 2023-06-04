import { collectionGroup, getDocs } from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import BackHeader from "../../components/Header/BackHeader";
import { db } from "../../lib/firebase";
import { getUserData, verifyIdToken } from "../../lib/firebaseAdmin";
import s from "../../styles/Home.module.scss";
import { Props } from "../../types/interfaces";
import { User } from "../../hooks/useUser";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    const token = await verifyIdToken(cookies.token);
    // if (!token) return;
    // const convertSecondsToTime = (seconds: number) => {
    //   const days = Math.floor(seconds / (3600 * 24));
    //   const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    //   const minutes = Math.floor((seconds % 3600) / 60);
    //   const remainingSeconds = seconds % 60;

    //   return { days, hours, minutes, seconds: remainingSeconds };
    // };
    // console.log(convertSecondsToTime(token.exp));
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
    // console.log();
    // if (!myPost) {
    //   return {
    //     notFound: true,
    //   };
    // }
    // console.log(sort);
    return {
      props: {
        user,
        uid,
        // posts,
        email,
        // myPost: post,
      },
    };
  } catch (error) {
    console.log("SSR Error " + error);
    // context.res.writeHead(302, { Location: "/" });
    // context.res.writeHead(302, { Location: "/login" });
    // context.res.end();
    return {
      props: {
        user: [],
        uid: "",
        email: "",
      },
    };
  }
};
export default function Page({ user }: { user: any }) {
  const router = useRouter();
  return (
    <div className="user">
      <BackHeader>
        {/* {active} */}
        {/* <h2 className={s.title}>{router.query.user}</h2> */}
        <h2 className={s.title}>{user.id}</h2>
      </BackHeader>
      <div className={s.userContent}>This page currently display testuser</div>
    </div>
  );
}
