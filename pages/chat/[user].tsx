import { useRouter } from "next/router";
import s from "../../styles/Home.module.scss";
import BackHeader from "../../components/Header/BackHeader";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { GetServerSideProps } from "next";
import { fethUserDoc, userToJSON } from "../../lib/firebase";
import { getUserData } from "../../lib/firebaseAdmin";
import Image from "next/image";
import Link from "next/link";
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const uid = context.query.user!;

    const user = await fethUserDoc(uid);
    // const userQuery = doc(db, `users/${uid}`);
    // const user = await getDoc(userQuery);
    const account = (await getUserData(uid as string))! as UserRecord;
    const accountJSON = userToJSON(account);
    // console.log(account);
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
  return (
    <div className="user">
      <BackHeader>
        <div style={{ display: "flex", flex: "1", gap: ".5rem" }}>
          <Link href={`/${account?.uid}`}>
            <Image
              priority={false}
              alt={account?.displayName ? account?.displayName : "Unknown User"}
              width={200}
              height={200}
              style={{
                objectFit: "cover",
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                border: "0",
                backgroundColor: "rgb(221, 221, 221)",
                marginTop: "2px !important",
                margin: "0",
              }}
              src={
                account?.uid === "rEvJE0sb1yVJxfHTbtn915TSfqJ2"
                  ? "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
                  : account?.photoURL
                  ? account?.photoURL
                  : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
              }
            />
          </Link>
          <div
            style={{
              display: "flex",
              flex: "1",
              alignItems: "center",
            }}
          >
            <Link href={`/${account?.uid}`}>
              <p style={{ marginTop: "-7px" }} className={s.title}>
                {account?.displayName}
              </p>
            </Link>
          </div>
        </div>
      </BackHeader>
      <div className={s.container}></div>
    </div>
  );
}
