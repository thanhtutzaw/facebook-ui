import { useRouter } from "next/router";
import styles from "../../styles/Home.module.scss";
import { Props } from "../../types/interfaces";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

export default function Navitems(props: {
  active: Props["active"];
  setActive: Function;
  icon: JSX.Element;
  name: string;
  index: number;
}) {
  const { UnReadNotiCount, friendReqCount } = useContext(AppContext) as Props;

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
  const notiCount = parseInt(UnReadNotiCount!.toString());
  const requestCount = parseInt(friendReqCount!.toString());
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
          {/* {requestCount} */}
          {TabName === "friends" && requestCount > 0 && (
            <>
              <span className={styles.badge}>
                {Math.min(requestCount, 9)}
                {requestCount > 9 && "+"}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
