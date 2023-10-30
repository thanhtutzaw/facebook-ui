import Spinner from "@/components/Spinner";
import useNotifications from "@/hooks/useNotifications";
import { checkPhotoURL } from "@/lib/firestore/profile";
import { Noti } from "@/types/interfaces";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import t from "../../Tabs.module.scss";
import s from "./Notifications.module.scss";

export default function Notifications({uid}:{uid:string}) {
  const {
    isLoading,
    hasNextPage,
    error,
    updateReadNoti,
    fetchNextPage,
    notifications,
  } = useNotifications(uid);
  return (
    <div
      id="notifications"
      onScroll={async (e) => {
        const target = e.currentTarget as HTMLElement;
        if (window.innerHeight + target.scrollTop + 1 >= target.scrollHeight) {
          if (hasNextPage) {
            console.log("fetch more data");
            await fetchNextPage();
          }
        }
      }}
    >
      <div className={`bold-title ${t.header}`}>
        <h2>Notifications</h2>
      </div>
      <div className={s.container}>
        {isLoading ? (
          <Spinner style={{ marginTop: "0" }} />
        ) : error ? (
          <p className="text-center text-red">
            Unexpected Error !
          </p>
        ) : notifications?.length === 0 ? (
          <p style={{ textAlign: "center" }}>Empty Notifications</p>
        ) : (
          <ul>
            {notifications?.map((noti: Noti) => (
              <NotiItem
                updateReadNoti={updateReadNoti}
                key={noti.id}
                noti={noti}
              />
            ))}
          </ul>
        )}
        {hasNextPage && !error && <Spinner style={{ marginBlock: "1rem" }} />}
      </div>
    </div>
  );
}
function NotiItem({
  noti,
  updateReadNoti,
}: {
  noti: Noti;
  updateReadNoti: ReturnType<typeof useNotifications>["updateReadNoti"];
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
  const [visited, setVisited] = useState(hasRead);

  return (
    <li
      onClick={() => {
        if (!hasRead) {
          updateReadNoti(noti);
          setVisited(true);
        }
      }}
      style={
        {
          // backgroundColor: !hasRead ? "rgb(228 228 228 / 50%)" : "initial",
        }
      }
      className={s.item}
    >
      <Link
        prefetch={false}
        // href={`${url.match(/^[a-zA-Z]{1,}:\/\//) ? `/${url}` : `${url}`} `}
        href={url}
      >
        {/*  */}
        {/* {visited ? "vistied" : "notvisited"} */}
        {/* {hasRead ? "hasRead" : " nothasRead"} */}
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
              // router.push(uid ?? "");
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
