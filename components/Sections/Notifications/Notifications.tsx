import React, { useContext, useEffect } from "react";
import s from "./Notifications.module.scss";
import t from "../../Tabs/Tabs.module.scss";
import Spinner from "../../Spinner";
import { useActive } from "../../../hooks/useActiveTab";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { AppContext } from "../../../context/AppContext";
import { NotiTypes, Props } from "../../../types/interfaces";
import Link from "next/link";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";
import { getMessage } from "../../../lib/firestore/notifications";
import { useRouter } from "next/router";
import useReactQueryInfiniteScroll from "../../../hooks/useReactQueryInfiniteScroll";
import error from "next/error";
const LIMIT = 10;
export default function Notifications() {
  const { active: tab } = useActive();
  const { uid } = useContext(AppContext) as Props;
  const fetchNoti = async function (pageParam: NotiTypes | null = null) {
    console.log("fetching");
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
    const data = snapShot.docs.map((doc) => {
      const data = doc.data() as NotiTypes;
      return {
        id: doc.id,
        ...doc.data(),
        ...getMessage(data.type),
      };
    }) as NotiTypes[];
    const hasMore = data.length > LIMIT;
    if (hasMore) {
      data.pop();
      console.log(data.length);
    }
    return { data, hasMore };
  };

  const queryClient = useQueryClient();
  const previousQuery = queryClient.getQueryData([
    "notifications",
  ]) as NotiTypes[];
  const { data, hasNextPage, isLoading, fetchNextPage, error } =
    useReactQueryInfiniteScroll(fetchNoti, tab === "notifications");
  // useEffect(() => {
  //   console.log(data?.length);
  //   console.log(previousQuery?.length);
  // }, [data, previousQuery?.length]);
  const noti = data?.pages.flatMap((n) => n?.data ?? []);
  return (
    <div
      id="notifications"
      onScroll={(e) => {
        if (
          window.innerHeight + e.currentTarget.scrollTop + 1 >=
          e.currentTarget.scrollHeight
        ) {
          if (hasNextPage) {
            console.log("fetch more Noti");
            fetchNextPage();
          }
        }
      }}
    >
      <div className={t.header}>
        <h2>Notifications</h2>
      </div>
      <div className={s.container}>
        {isLoading ? (
          <Spinner />
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
