import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { GetServerSideProps } from "next";
import { ChatHeader } from "../../components/Chat/Header";
import ChatInput from "../../components/Chat/Input";
import BackHeader from "../../components/Header/BackHeader";
import { fethUserDoc, userToJSON } from "../../lib/firebase";
import { getUserData } from "../../lib/firebaseAdmin";
import s from "../../styles/Home.module.scss";
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const uid = context.query.user!;

    const user = await fethUserDoc(uid);
    if (user.exists()) {
      const account = (await getUserData(String(uid)))! as UserRecord;
      const accountJSON: UserRecord = userToJSON(account);
      return {
        props: {
          account: accountJSON ,
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
        <ChatInput />
      </div>
    </div>
  );
}
