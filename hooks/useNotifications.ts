import { AppContext } from "@/context/AppContext";
import { NOTI_LIMIT } from "@/lib/QUERY_LIMIT";
import { DescQuery, db, getCollectionPath, getPath } from "@/lib/firebase";
import { getMessage } from "@/lib/firestore/notifications";
import { AppProps, NotiTypes } from "@/types/interfaces";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  Timestamp,
  doc,
  getDocs,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
} from "firebase/firestore";
import { useContext, useEffect } from "react";
import { useActive } from "./useActiveTab";
function useNotifications() {
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
    let notiQuery = DescQuery(
      getPath("notifications", { uid: currentUid }),
      NOTI_LIMIT + 1
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
    // let notiQuery = query(
    //   getPath("notifications", { uid: currentUid }),
    //   limit(NOTI_LIMIT + 1)
    // );
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
  return {isLoading, hasNextPage, error, updateReadNoti,fetchNextPage, noti };
}

export default useNotifications;
