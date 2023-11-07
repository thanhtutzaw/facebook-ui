import Spinner from "@/components/Spinner";
import { AppContext } from "@/context/AppContext";
import useNotifications from "@/hooks/useNotifications";
import { AppProps, Noti } from "@/types/interfaces";
import { memo, useContext } from "react";
import t from "../../Tabs.module.scss";
import s from "./Notifications.module.scss";
import { NotiItem } from "./NotiItem";
export const Notifications = memo(function Notifications() {
  const {
    uid: currentUid,
    UnReadNotiCount,
    setUnReadNotiCount,
  } = useContext(AppContext) as AppProps;

  const {
    isLoading,
    hasNextPage,
    error,
    updateReadNoti,
    fetchNextPage,
    notifications,
  } = useNotifications({
    uid: currentUid!,
    UnReadNotiCount: UnReadNotiCount!,
    setUnReadNotiCount: setUnReadNotiCount!,
  });

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
          <Spinner />
        ) : error ? (
          <p className="text-center text-red">Unexpected Error !</p>
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
})
