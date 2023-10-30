import { NOTI_LIMIT, UnReadNoti_LIMIT } from "@/lib/QUERY_LIMIT";
import { DescQuery, db, getCollectionPath, getPath } from "@/lib/firebase";
import { getMessage } from "@/lib/firestore/notifications";
import { AppProps, Noti, QueryKey } from "@/types/interfaces";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Timestamp,
  Unsubscribe,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useActive } from "./useActiveTab";
import useQueryFn from "./useQueryFn";
function useNotifications(currentUid: string) {
  const { active: tab } = useActive();
  const fetchNoti = async function (pageParam: Noti | null = null) {
    if (!currentUid) return;
    let notiQuery = DescQuery(
      getPath("notifications", { uid: currentUid }),
      NOTI_LIMIT + 1
    );
    const userDoc = doc(db, getCollectionPath.users({ uid: currentUid }));
    await updateDoc(userDoc, { lastPullTimestamp: serverTimestamp() });
    // if (UnReadNotiCount === 1 && UnReadNotiCount > 0) {
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
      const notifications = snapShot.docs.map((doc) => {
        const data = doc.data() as Noti;
        // const date = data.createdAt as Timestamp;
        // const createdDate = date.toDate().getTime();
        // const lastPullData = lastPullTimestamp as Timestamp;
        // const lastPull = lastPullData ? lastPullData?.toDate().getTime() : null;
        return {
          id: doc.id,
          ...doc.data(),
          ...getMessage(data.type),
          hasRead: doc.data().hasRead ? doc.data().hasRead : false,
        };
      }) as Noti[];
      const hasMore = notifications.length > NOTI_LIMIT;
      if (hasMore) {
        notifications.pop();
      }
      setUnReadNotiCount?.(0);
      return { notifications, hasMore };
    } catch (error) {
      console.error(error);
    }
  };
  const { queryFn } = useQueryFn();
  const [UnReadNotiCount, setUnReadNotiCount] = useState(0);
  const [lastPullTimestamp, setlastPullTimestamp] =
    useState<AppProps["lastPullTimestamp"]>(undefined);
  useEffect(() => {
    if (UnReadNotiCount ?? 0 > 0) {
      queryFn.refetchQueries("noti");
      queryFn.invalidate("noti");
      console.log("updaing in useNoti hooks");
    }
  }, [UnReadNotiCount, queryFn]);

  const { fetchNextPage, hasNextPage, isLoading, error, data } =
    useInfiniteQuery({
      queryKey: [QueryKey.noti],
      queryFn: async ({ pageParam }) => {
        return await fetchNoti(pageParam);
      },
      enabled: tab === "notifications",
      // keepPreviousData: true,
      getNextPageParam: (lastPage) =>
        lastPage?.hasMore
          ? lastPage.notifications![lastPage?.notifications?.length! - 1]
          : undefined,
    });

  const notifications = data?.pages.flatMap(
    (page) => page?.notifications ?? []
  );
  // useEffect(() => {
  //   // let unsubscribe: Unsubscribe;
  //   // unsubscribe = onSnapshot(notiQuery, async (snapshot) => {
  //   //   const notis = snapshot.docs.map((doc) => doc.data()) as Noti;
  //   //   const withAuthor = await Promise.all(
  //   //     likes.map(async (l) => {
  //   //       if (l.uid) {
  //   //         return { ...l, author };
  //   //       } else {
  //   //         return { ...l, author: null };
  //   //       }
  //   //     })
  //   //   );
  // }, [currentUid]);

  useEffect(() => {
    if (!currentUid) return;
    let unsubscribeNotifications: Unsubscribe;
    const fetchNotiCount = async () => {
      const userDoc = doc(db, getCollectionPath.users({ uid: currentUid }));
      try {
        const doc = await getDoc(userDoc);
        const lastPull = doc.data()?.lastPullTimestamp ?? Date.now();
        setlastPullTimestamp(lastPull);
        const notiCountQuery = query(
          getPath("notifications", { uid: currentUid }),
          where("createdAt", ">", lastPull),
          limit(UnReadNoti_LIMIT)
        );
        // if (UnReadNotiCount >= 10) return;
        // console.log("noti listening realtime - unRead" + UnReadNotiCount);
        unsubscribeNotifications = onSnapshot(notiCountQuery, (latestNoti) => {
          // console.log(querySnapshot.docs.map((doc) => doc.data()));
          setUnReadNotiCount(latestNoti.size); // getting unRead noti count
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchNotiCount();
    return () => {
      if (unsubscribeNotifications) unsubscribeNotifications();
    };
  }, [UnReadNotiCount, currentUid]);
  function updateReadNoti(noti: Noti) {
    const ref = doc(
      db,
      `${getCollectionPath.notifications({ uid: currentUid })}/${noti.id}`
    );
    const { message, ...rest } = noti;
    const readedData = {
      ...rest,
      hasRead: true,
    };
    queryFn.invalidate("noti");
    // queryClient.refetchQueries(["notifications"]);
    updateDoc(ref, readedData);
  }
  return {
    UnReadNotiCount,
    setUnReadNotiCount,
    isLoading,
    hasNextPage,
    error,
    updateReadNoti,
    fetchNextPage,
    notifications,
  };
}

export default useNotifications;
