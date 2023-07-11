import { useRouter } from "next/router";
import { useActive } from "../../hooks/useActiveTab";
import styles from "../../styles/Home.module.scss";

export default function Navitems(props: any) {
  const { active, setActive } = useActive();
  const { icon, name, index } = props;
  const router = useRouter();
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
      // if (active !== "/" && tab.scrollTop >= 60) return;
      console.log(tab.scrollTop);
      console.log("refreshing new data in Newsfeed");
      router.replace("/", undefined, { scroll: false });
    }
  };
  return (
    <div onClick={changeTab} className={`${styles.navItems} ${activeClass}`}>
      <div>{icon}</div>
    </div>
  );
}
