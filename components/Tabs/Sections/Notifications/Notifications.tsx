import Spinner from "@/components/Spinner";
import { AppContext } from "@/context/AppContext";
import { useActive } from "@/hooks/useActiveTab";
import { NOTI_LIMIT } from "@/lib/QUERY_LIMIT";
import { db, getCollectionPath, getPath } from "@/lib/firebase";
import { getMessage } from "@/lib/firestore/notifications";
import { checkPhotoURL } from "@/lib/firestore/profile";
import { AppProps, NotiTypes } from "@/types/interfaces";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  Timestamp,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import t from "../../Tabs.module.scss";
import s from "./Notifications.module.scss";

export default function Notifications() {
  const { active: tab } = useActive();
  const {
    uid: currentUid,
    lastPullTimestamp,
    UnReadNotiCount,
    setUnReadNotiCount,
  } = useContext(AppContext) as AppProps;
  const fetchNoti = async function (pageParam: NotiTypes | null = null) {
    console.log("fetching noti");
    if (!currentUid) return;
    let notiQuery = query(
      getPath("notifications", { uid: currentUid }),
      orderBy("createdAt", "desc"),
      limit(NOTI_LIMIT + 1)
    );
    const userDoc = doc(db, getCollectionPath.users({ uid: currentUid }));
    await updateDoc(userDoc, { lastPullTimestamp: serverTimestamp() });
    // if (UnReadNotiCount === 1 && UnReadNotiCount > 0) {
    // setUnReadNotiCount?.(0);
    // }
    if (pageParam) {
      const date = new Timestamp(
        pageParam.createdAt.seconds,
        pageParam.createdAt.nanoseconds
      );
      notiQuery = query(notiQuery, startAfter(date));
    }

    try {
      const snapShot = await getDocs(notiQuery);
      if (snapShot.empty) return;
      const noti = snapShot.docs.map((doc) => {
        const data = doc.data() as NotiTypes;
        const date = data.createdAt as Timestamp;
        const createdDate = date.toDate().getTime();
        const lastPullData = lastPullTimestamp as Timestamp;
        const lastPull = lastPullData ? lastPullData?.toDate().getTime() : null;
        return {
          id: doc.id,
          ...doc.data(),
          ...getMessage(data.type),
          hasRead: doc.data().hasRead ? doc.data().hasRead : false,
        };
      }) as NotiTypes[];
      const hasMore = noti.length > NOTI_LIMIT;
      if (hasMore) {
        noti.pop();
      }
      setUnReadNotiCount?.(0);
      return { noti, hasMore };
    } catch (error) {
      console.error(error);
    }
  };
  const queryClient = useQueryClient();
  useEffect(() => {
    if (UnReadNotiCount ?? 0 > 0) {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.refetchQueries(["notifications"]);
    }
  }, [UnReadNotiCount, queryClient]);

  const { fetchNextPage, hasNextPage, isLoading, error, data } =
    useInfiniteQuery({
      queryKey: ["notifications"],
      queryFn: async ({ pageParam }) => {
        return await fetchNoti(pageParam);
      },
      enabled: tab === "notifications",
      // keepPreviousData: true,
      getNextPageParam: (lastPage) =>
        lastPage?.hasMore
          ? lastPage.noti![lastPage?.noti?.length! - 1]
          : undefined,
    });

  const noti = data?.pages.flatMap((page) => page?.noti ?? []);
  useEffect(() => {
    // if (!togglereactionList) return;
    let notiQuery = query(
      getPath("notifications", { uid: currentUid }),
      orderBy("createdAt", "desc"),
      limit(NOTI_LIMIT + 1)
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
  }, [currentUid]);
  function updateReadNoti(noti: NotiTypes) {
    const ref = doc(db, `${getCollectionPath.notifications}/${noti.id}`);
    const { message, ...rest } = noti;
    const readedData = {
      ...rest,
      hasRead: true,
    };
    queryClient.invalidateQueries(["notifications"]);
    // queryClient.refetchQueries(["notifications"]);
    console.log({ readedData });
    updateDoc(ref, readedData);
  }
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
          <Spinner style={{ marginTop: "0" }} />
        ) : error ? (
          <p style={{ textAlign: "center", color: "red" }}>
            Unexpected Error !
          </p>
        ) : noti?.length === 0 ? (
          <p style={{ textAlign: "center" }}>Empty Notifications</p>
        ) : (
          <ul>
            {noti?.map((n) => (
              <Noti updateReadNoti={updateReadNoti} key={n.id} noti={n} />
            ))}
          </ul>
        )}
        {hasNextPage && !error && <Spinner style={{ marginBlock: "1rem" }} />}
      </div>
    </div>
  );
}
function Noti({
  noti,
  updateReadNoti,
}: {
  noti: NotiTypes;
  updateReadNoti: (noti: NotiTypes) => void;
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
