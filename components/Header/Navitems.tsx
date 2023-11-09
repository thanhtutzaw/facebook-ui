import { PageContext, PageProps } from "@/context/PageContext";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import styles from "../../styles/Home.module.scss";
import { AppProps, Tabs } from "../../types/interfaces";
import useQueryFn from "@/hooks/useQueryFn";

export default function Navitems(props: {
  active: Tabs;
  setActive: Function;
  icon: JSX.Element;
  name: string;
  index: number;
}) {
  const { queryFn } = useQueryFn();
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
  const changeTab = () => {
     const tabs = document.getElementById("tabs")!;
     const tab = document.getElementById(TabName)!;
    if (TabName === active) {
      tab.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      if (tab.scrollTop >= 60) return;
      if (active === "/") {
        console.log("refreshing new data in Newsfeed");
        router.replace("/", undefined, { scroll: false });
      } else if (active === "friends") {
        router.replace("/#friends", undefined, { scroll: false });
      } else if (TabName === "notifications") {
        setUnReadNotiCount?.(0);
        console.log("reseting");
        queryFn.invalidate("noti");
        queryFn.refetchQueries("noti");
      }
      return;
    }
    setActive?.(TabName);
    window.location.hash = TabName === "/" ? "#home" : `#${TabName}`;
    // const main = document.getElementsByTagName("main")[0]!;
    tabs.scrollTo({
      left: index * tabs.clientWidth,
      behavior: "smooth",
    });
    
  };

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
  const badge = {
    home: null,
    "/": null,
    friends: friendRequestCount > 0 && (
      <span className={styles.badge}>
        {Math.min(friendRequestCount, 9)}
        {friendRequestCount > 9 && "+"}
      </span>
    ),
    watch: null,
    profile: null,
    menu: null,
    notifications: active !== "notifications" && (notiCount ?? 0) >= 1 && (
      <>
        <span className={styles.badge}>
          {Math.min(notiCount ?? 0, 9)}
          {(notiCount ?? 0) > 9 && "+"}
        </span>
      </>
    ),
  };
  return (
    <div onClick={changeTab} className={`${styles.navItems} ${activeClass}`}>
      <div role="button" aria-label={iconTitle} title={navTitle[TabName]}>
        <div style={{ position: "relative" }}>
          {TabIcon}
          {badge[TabName]}
        </div>
      </div>
    </div>
  );
}
