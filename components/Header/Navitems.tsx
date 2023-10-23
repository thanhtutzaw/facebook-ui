import { useRouter } from "next/router";
import styles from "../../styles/Home.module.scss";
import { AppProps, Tabs } from "../../types/interfaces";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { PageContext, PageProps } from "@/context/PageContext";
import { useQueryClient } from "@tanstack/react-query";

export default function Navitems(props: {
  active: Tabs;
  setActive: Function;
  icon: JSX.Element;
  name: string;
  index: number;
}) {
  const { UnReadNotiCount, setUnReadNotiCount } = useContext(
    AppContext
  ) as AppProps;
  const { friendReqCount } = useContext(PageContext) as PageProps;

  const [notiCount, setNotiCount] = useState(UnReadNotiCount);
  useEffect(() => {
    setNotiCount(UnReadNotiCount);
  }, [UnReadNotiCount]);
  const { active, setActive, icon: TabIcon, name, index } = props;
  const router = useRouter();
  let iconTitle = name === "/" ? "Home" : name;
  const TabName = name.toLowerCase() as Tabs;
  const queryClient = useQueryClient();
  const changeTab = () => {
    setActive?.(TabName);
    window.location.hash = TabName === "/" ? "#home" : `#${TabName}`;
    const tabs = document.getElementById("tabs")!;
    const tab = document.getElementById(TabName)!;
    // const main = document.getElementsByTagName("main")[0]!;
    tabs.scrollTo({
      left: index * tabs.clientWidth,
      behavior: "smooth",
    });
    if (TabName === active) {
      tab.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      // if (active !== "home") return;
      if (tab.scrollTop >= 60) return;
      if (active === "/") {
        console.log("refreshing new data in Newsfeed");
        router.replace("/", undefined, { scroll: false });
      } else if (active === "friends") {
        router.replace("/#friends", undefined, { scroll: false });
      } else if (TabName === "notifications") {
        // setNotiCount(0);
        // if (UnReadNotiCount ?? 0 > 0) {
        // }
        setUnReadNotiCount?.(0);
        queryClient.invalidateQueries(["notifications"]);
        queryClient.refetchQueries(["notifications"]);
      }
    }
  };
  // useEffect(() => {
  //   if (active === "notifications") {
  //     setUnReadNotiCount?.(0);
  //   }
  // }, [active, setUnReadNotiCount]);
  // useEffect(() => {
  //   if (active && active === "notifications") {
  //     setUnReadNotiCount?.(0);
  //   }
  // }, [active, setUnReadNotiCount]);

  const activeClass = active === TabName ? styles.active : "";
  const friendRequestCount = parseInt(
    friendReqCount ? friendReqCount?.toString() : "0"
  );
  const navTitle: { [key in Tabs]: string } = {
    home: iconTitle,
    "/": iconTitle,
    friends: iconTitle,
    watch: iconTitle,
    profile: iconTitle,
    menu: iconTitle,
    notifications: `${
      (notiCount ?? 0) > 0 ? `${iconTitle} (${notiCount})` : iconTitle
    }`,
  };
  return (
    <div onClick={changeTab} className={`${styles.navItems} ${activeClass}`}>
      <div role="button" aria-label={iconTitle} title={navTitle[TabName]}>
        <div style={{ position: "relative" }}>
          {TabIcon}
          {/* {UnReadNotiCount},{notiCount} */}
          {TabName === "notifications" &&
            active !== "notifications" &&
            (notiCount ?? 0) >= 1 && (
              <>
                <span className={styles.badge}>
                  {Math.min(notiCount ?? 0, 9)}
                  {(notiCount ?? 0) > 9 && "+"}
                </span>
              </>
            )}
          {TabName === "friends" && friendRequestCount > 0 && (
            <>
              <span className={styles.badge}>
                {Math.min(friendRequestCount, 9)}
                {friendRequestCount > 9 && "+"}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
