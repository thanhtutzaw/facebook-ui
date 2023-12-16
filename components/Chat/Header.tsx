import { checkPhotoURL } from "@/lib/firestore/profile";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import Image from "next/image";
import Link from "next/link";

export function ChatHeader({ account }: { account: UserRecord }) {
  return (
    <div className={`flex flex-1 gap-2 items-center overflow-hidden`}>
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
      <div
        className={`flex flex-1 gap-2 items-center overflow-hidden overflow-ellipsis
      `}
      >
        <Link className="overflow-hidden" href={`/${account?.uid}`}>
          <h3 className="font-semibold text-base m-0 overflow-hidden overflow-ellipsis">
            {account?.displayName}
          </h3>
        </Link>
      </div>
    </div>
  );
}
