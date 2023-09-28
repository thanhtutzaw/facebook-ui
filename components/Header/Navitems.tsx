import { useRouter } from "next/router";
import styles from "../../styles/Home.module.scss";
import { AppProps, Tabs } from "../../types/interfaces";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { PageContext, PageProps } from "@/context/PageContext";

export default function Navitems(props: {
  active: Tabs;
  setActive: Function;
  icon: JSX.Element;
  name: string;
  index: number;
}) {
  const { UnReadNotiCount, friendReqCount } = useContext(
    AppContext
  ) as AppProps;
  // const { setActive } = useContext(PageContext) as PageProps;

  // const { active, icon: TabIcon, name, index } = props;
  const { active, setActive, icon: TabIcon, name, index } = props;
  const router = useRouter();
  let iconTitle = name === "/" ? "Home" : name;
  const TabName = name.toLowerCase();
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
      }
    }
  };
  const activeClass = active === TabName ? styles.active : "";
  // const activeClass = "";
  const notiCount = parseInt(UnReadNotiCount!.toString());
  const friendRequestCount = parseInt(
    friendReqCount ? friendReqCount?.toString() : "0"
  );
  return (
    <div onClick={changeTab} className={`${styles.navItems} ${activeClass}`}>
      <div role="button" aria-label={iconTitle} title={iconTitle}>
        <div style={{ position: "relative" }}>
          {TabIcon}
          {TabName === "notifications" && notiCount > 0 && (
            <>
              <span className={styles.badge}>
                {Math.min(notiCount, 9)}
                {notiCount > 9 && "+"}
              </span>
            </>
          )}
          {/* {friendRequestCount} */}
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
