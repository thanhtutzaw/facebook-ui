import { checkPhotoURL } from "@/lib/firestore/profile";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import Image from "next/image";
import Link from "next/link";
import s from "./index.module.scss";

export function ChatHeader({ account }: { account: UserRecord }) {
  return (
    <div className={s.chatHeader}>
      <Link
        style={{
          display: "flex",
        }}
        href={`/${account?.uid}`}
      >
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
          src={checkPhotoURL(account?.photoURL)}
        />
      </Link>
      <div className={s.info}>
        <Link href={`/${account?.uid}`}>
          <p className={s.title}>{account?.displayName}</p>
        </Link>
      </div>
    </div>
  );
}
