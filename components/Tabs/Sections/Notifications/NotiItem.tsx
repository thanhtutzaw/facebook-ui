import { checkPhotoURL } from "@/lib/firestore/profile";
import { Noti } from "@/types/interfaces";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import s from "./Notifications.module.scss";

export function NotiItem({
  noti,
  updateReadNoti,
}: {
  noti: Noti;
  updateReadNoti: Function;
}) {
  const router = useRouter();
  const {
    hasRead,
    id,
    content,
    message,
    uid,
    url,
    photoURL,
    userName,
    createdAt,
  } = noti;

  return (
    <li
      onClick={() => {
        if (!hasRead) {
          updateReadNoti(noti);
        }
      }}
      className={s.item}
    >
      <Link
        prefetch={false}
        // href={`${url.match(/^[a-zA-Z]{1,}:\/\//) ? `/${url}` : `${url}`} `}
        href={url}
      >
        <div className={`${s.new} ${hasRead === false ? s.unRead : ""}`}></div>
        <Image
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // router.push(uid ?? "");
            router.push({ query: { user: uid } }, String(uid));
          }}
          className={s.profile}
          priority={false}
          alt={userName ?? "Unknown User"}
          width={200}
          height={200}
          src={checkPhotoURL(photoURL)}
        />
        <div className={s.message}>
          <span
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push({ query: { user: uid } }, String(uid));
            }}
            className={s.userName}
          >
            {userName ?? "Unknown User"}
          </span>{" "}
          {message}
          {content && <p className={s.content}>{content ?? ""}</p>}
          <p className={s.date} suppressHydrationWarning>
            {new Timestamp(createdAt?.seconds, createdAt?.nanoseconds)
              .toDate()
              .toLocaleDateString("en-US", {
                year: "2-digit",
                month: "short",
                day: "numeric",
              })}
          </p>
        </div>
      </Link>
      <p className={s.dateDesktop} suppressHydrationWarning>
        {new Timestamp(createdAt?.seconds, createdAt?.nanoseconds)
          .toDate()
          .toLocaleDateString("en-US", {
            year: "2-digit",
            month: "short",
            day: "numeric",
          })}
      </p>
    </li>
  );
}
