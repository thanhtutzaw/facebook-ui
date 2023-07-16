import { useRouter } from "next/router";
import { useActive } from "../../hooks/useActiveTab";
import styles from "../../styles/Home.module.scss";

export default function Navitems(props: any) {
  const { active, setActive } = useActive();
  const { icon: TabIcon, name, index } = props;
  const router = useRouter();
  let iconTitle = name === "/" ? "Home" : name;
  const TabName = name.toLowerCase();
  const activeClass = active === TabName ? styles.active : "";

  const changeTab = () => {
    setActive(TabName);
    window.location.hash = TabName === "/" ? "#home" : "#" + TabName;
    const tabs = document.getElementById("tabs")!;
    const tab = document.getElementById(TabName)!;
    tabs.scrollTo({
      left: index * tabs.clientWidth,
      behavior: "smooth",
    });
    if (TabName === active) {
      tab.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      if (active !== "/") return;
      if (tab.scrollTop >= 60) return;
      console.log("refreshing new data in Newsfeed");
      router.replace("/", undefined, { scroll: false });
    }
  };
  return (
    <div onClick={changeTab} className={`${styles.navItems} ${activeClass}`}>
      <div aria-label={iconTitle} title={iconTitle}>
        {TabIcon}
      </div>
    </div>
  );
}
