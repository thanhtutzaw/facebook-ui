import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Timestamp,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { AppContext } from "../../../context/AppContext";
import { useActive } from "../../../hooks/useActiveTab";
import { db } from "../../../lib/firebase";
import { getMessage } from "../../../lib/firestore/notifications";
import { NotiTypes, Props } from "../../../types/interfaces";
import Spinner from "../../Spinner";
import t from "../../Tabs/Tabs.module.scss";
import s from "./Notifications.module.scss";
import error from "next/error";
const LIMIT = 10;
export default function Notifications() {
  const { active: tab } = useActive();
  const { uid } = useContext(AppContext) as Props;
  const fetchNoti = async function (pageParam: NotiTypes | null = null) {
    console.log("fetching noti");
    if (!uid) return;
    let notiQuery = query(
      collection(db, `/users/${uid}/notifications`),
      orderBy("createdAt", "desc"),
      limit(LIMIT + 1)
    );
    if (pageParam) {
      const date = new Timestamp(
        pageParam.createdAt.seconds,
        pageParam.createdAt.nanoseconds
      );
      notiQuery = query(notiQuery, startAfter(date));
    }
    const snapShot = await getDocs(notiQuery);
    const noti = snapShot.docs.map((doc) => {
      const data = doc.data() as NotiTypes;
      return {
        id: doc.id,
        ...doc.data(),
        ...getMessage(data.type),
      };
    }) as NotiTypes[];
    const hasMore = noti.length > LIMIT;
    if (hasMore) {
      noti.pop();
    }
    return { noti, hasMore };
  };

  const { fetchNextPage, hasNextPage, isLoading, error, data } =
    useInfiniteQuery({
      queryKey: ["notifications"],
      queryFn: async ({ pageParam }) => {
        // console.log(pageParam);
        return await fetchNoti(pageParam);
      },
      enabled: tab === "notifications",
      keepPreviousData: true,
      getNextPageParam: (lastPage) =>
        lastPage?.hasMore
          ? lastPage.noti![lastPage?.noti?.length! - 1]
          : undefined,
    });

  const noti = data?.pages.flatMap((page) => page?.noti ?? []);
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
      <div className={t.header}>
        <h2>Notifications</h2>
      </div>
      <div className={s.container}>
        {isLoading ? (
          <Spinner fullScreen />
        ) : error ? (
          <p>Unexpected Error </p>
        ) : noti?.length === 0 ? (
          <p style={{ textAlign: "center" }}>Empty Notifications</p>
        ) : (
          <ul>
            {noti?.map((n) => (
              <NotiItem key={n.id} noti={n} />
            ))}
          </ul>
        )}
        {hasNextPage && <Spinner style={{ marginBlock: "1rem" }} />}
      </div>
    </div>
  );
}
function NotiItem({ noti }: { noti: NotiTypes }) {
  const router = useRouter();
  const { id, content, message, uid, url, photoURL, userName, createdAt } =
    noti;
  return (
    <li className={s.item}>
      <Link
        prefetch={false}
        // href={`${url.match(/^[a-zA-Z]{1,}:\/\//) ? `/${url}` : `${url}`} `}
        href={url}
      >
        <Image
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(uid ?? "");
          }}
          className={s.profile}
          priority={false}
          alt={userName ?? "Unknown User"}
          width={200}
          height={200}
          src={
            photoURL ??
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
          }
        />
        <div className={s.message}>
          <span
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(uid ?? "");
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
