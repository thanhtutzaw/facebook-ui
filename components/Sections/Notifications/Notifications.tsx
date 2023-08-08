import React, { useContext, useEffect } from "react";
import s from "./Notifications.module.scss";
import Spinner from "../../Spinner";
import { useActive } from "../../../hooks/useActiveTab";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { AppContext } from "../../../context/AppContext";
import { NotiTypes, Props } from "../../../types/interfaces";
import Link from "next/link";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";
import { getMessage } from "../../../lib/firestore/notifications";
import { useRouter } from "next/router";
export default function Notifications() {
  const { active: tab } = useActive();
  const { uid } = useContext(AppContext) as Props;
  const fetchNoti = async function () {
    console.log("fetching");
    if (!uid) return;
    let notiQuery = query(
      collection(db, `/users/${uid}/notifications`),
      orderBy("createdAt", "desc")
    );
    const notiDoc = await getDocs(notiQuery);
    return notiDoc.docs.map((doc) => {
      const data = doc.data() as NotiTypes;
      return {
        id: doc.id,
        ...doc.data(),
        ...getMessage(data.type),
      };
    }) as NotiTypes[];
  };
  const { isLoading, error, data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => await fetchNoti(),
    enabled: tab === "notifications",
    keepPreviousData: true,
  });
  const queryClient = useQueryClient();
  const previousQuery = queryClient.getQueryData([
    "notifications",
  ]) as NotiTypes[];
  useEffect(() => {
    console.log(data?.length);
    console.log(previousQuery?.length);
  }, [data, previousQuery?.length]);

  return (
    <div className={s.container}>
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p>Unexpected Error </p>
      ) : data?.length === 0 ? (
        <p style={{ textAlign: "center" }}>Empty Notifications</p>
      ) : (
        <ul className={s.content}>
          {data?.map((noti) => (
            <NotiItem key={noti.id} noti={noti} />
          ))}
        </ul>
      )}
    </div>
  );
}
function NotiItem({ noti }: { noti: NotiTypes }) {
  const router = useRouter();
  const { id, message, uid, url, photoURL, userName, createdAt } = noti;
  return (
    <li className={s.item}>
      <Link prefetch={false} href={`/${url}`}>
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
        <p className={s.message}>
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
        </p>
      </Link>
      <p className={s.date} suppressHydrationWarning>
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
