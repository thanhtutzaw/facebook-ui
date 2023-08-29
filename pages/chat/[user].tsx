import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { GetServerSideProps } from "next";
import BackHeader from "../../components/Header/BackHeader";
import { fethUserDoc, userToJSON } from "../../lib/firebase";
import { getUserData } from "../../lib/firebaseAdmin";
import s from "../../styles/Home.module.scss";
import ChatInput from "../../components/Chat/Input";
import { ChatHeader } from "../../components/Chat/Header";
import { useContext } from "react";
import { PageContext, PageProps } from "../../context/PageContext";
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const uid = context.query.user!;

    const user = await fethUserDoc(uid);
    // const userQuery = doc(db, `users/${uid}`);
    // const user = await getDoc(userQuery);
    const account = (await getUserData(uid as string))! as UserRecord;
    const accountJSON = userToJSON(account);
    if (user.exists()) {
      return {
        props: {
          account: accountJSON ?? null,
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
      },
    };
  }
};
export default function FriendChat(props: { account: UserRecord }) {
  const { account } = props;
  const { currentUser } = useContext(PageContext) as PageProps;

  return (
    <div className="user">
      <BackHeader>
        <ChatHeader account={account} />
      </BackHeader>

      <div className={s.container}>
        <div
          style={{
            textAlign: "center",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,50%)",
          }}
        >
          Coming Soon
          
        </div>
        <ChatInput currentUser={currentUser} />
      </div>
    </div>
  );
}
