import Spinner from "@/components/Spinner";
import { AppContext } from "@/context/AppContext";
import useNotifications from "@/hooks/useNotifications";
import { AppProps, Noti } from "@/types/interfaces";
import { Suspense, memo, useContext } from "react";
import t from "../../Tabs.module.scss";
import s from "./Notifications.module.scss";
import { NotiItem } from "./NotiItem";
function Notifications({ tabIndex }: { tabIndex: number }) {
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
      aria-hidden={tabIndex === -1}
      id="notifications"
      tabIndex={tabIndex}
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
          <Spinner style={{ margin: "0" }} />
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
}
export default memo(Notifications);
