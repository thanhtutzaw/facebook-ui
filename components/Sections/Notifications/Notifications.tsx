import React, { useContext } from "react";
import s from "./Notifications.module.scss";
import Spinner from "../../Spinner";
import { useActive } from "../../../hooks/useActiveTab";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { AppContext } from "../../../context/AppContext";
import { NotiTypes, Props } from "../../../types/interfaces";
import Link from "next/link";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";
import { getMessage } from "../../../lib/firestore/notifications";
import { useRouter } from "next/router";
function Notifications() {
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
  const router = useRouter();
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
            <li key={noti.id} className={s.item}>
              <Link prefetch={false} href={noti.url}>
                <Image
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(noti.uid ?? "");
                  }}
                  className={s.profile}
                  priority={false}
                  alt={noti.userName ?? "Unknown User"}
                  width={200}
                  height={200}
                  style={{
                    objectFit: "cover",
                  }}
                  src={
                    noti.photoURL ??
                    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                  }
                />
                <p className={s.message}>
                  {/* <span>
                    hello lremd dfsdfsd hfkdsfhello lremd dfsdfsd
                    hfkdsfhellolremd dfsdfsd hfkdsfhello lremd dfsdfsd
                    hfkdsfhello lremd dfsdfsd hfkdsfhello lremd dfsdfsd
                    hfkdsfhello lremd dfsdfsd hfkdsf
                  </span> */}
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(noti.uid ?? "");
                    }}
                    className={s.userName}
                  >
                    {noti.userName ?? "Unknown User"}
                  </span>{" "}
                  {noti.message}
                </p>
              </Link>
              <p className={s.date} suppressHydrationWarning>
                {new Timestamp(
                  noti.createdAt?.seconds,
                  noti.createdAt?.nanoseconds
                )
                  .toDate()
                  .toLocaleDateString("en-US", {
                    year: "2-digit",
                    month: "short",
                    day: "numeric",
                  })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
