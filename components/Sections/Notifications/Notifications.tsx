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

    try {
      const snapShot = await getDocs(notiQuery);
      // if (snapShot.empty) {
      //   throw Error;
      // }
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
    } catch (error) {
      console.error(error);
    }
  };

  const { fetchNextPage, hasNextPage, isLoading, error, data } =
    useInfiniteQuery({
      queryKey: ["notifications"],
      queryFn: async ({ pageParam }) => {
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
  useEffect(() => {
    // if (!togglereactionList) return;
    let notiQuery = query(
      collection(db, `/users/${uid}/notifications`),
      orderBy("createdAt", "desc"),
      limit(LIMIT + 1)
    );
    // let unsubscribe: Unsubscribe;
    // unsubscribe = onSnapshot(notiQuery, async (snapshot) => {
    //   const notis = snapshot.docs.map((doc) => doc.data()) as NotiTypes;
    //   const withAuthor = await Promise.all(
    //     likes.map(async (l) => {
    //       if (l.uid) {
    //         const author = await getProfileByUID(l.uid?.toString());
    //         return { ...l, author };
    //       } else {
    //         return { ...l, author: null };
    //       }
    //     })
    //   );
    console.log("updatedNoti");
    // setLikes(withAuthor);
  }, [uid]);
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
          <Spinner />
        ) : error ? (
          <p style={{ textAlign: "center", color: "red" }}>
            Unexpected Error !
          </p>
        ) : noti?.length === 0 ? (
          <p style={{ textAlign: "center" }}>Empty Notifications</p>
        ) : (
          <ul>
            {noti?.map((n) => (
              <Noti key={n.id} noti={n} />
            ))}
          </ul>
        )}
        {hasNextPage && !error && <Spinner style={{ marginBlock: "1rem" }} />}
      </div>
    </div>
  );
}
function Noti({ noti }: { noti: NotiTypes }) {
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
