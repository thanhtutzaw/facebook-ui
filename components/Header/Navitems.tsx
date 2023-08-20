import { useRouter } from "next/router";
import styles from "../../styles/Home.module.scss";
import { Props } from "../../types/interfaces";

export default function Navitems(props: {
  active: Props["active"];
  setActive: Function;
  icon: JSX.Element;
  name: string;
  index: number;
}) {
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
      if (active !== "/") return;
      if (tab.scrollTop >= 60) return;
      console.log("refreshing new data in Newsfeed");
      router.replace("/", undefined, { scroll: false });
    }
  };
  const activeClass = active === TabName ? styles.active : "";

  return (
    <div onClick={changeTab} className={`${styles.navItems} ${activeClass}`}>
      <div role="button" aria-label={iconTitle} title={iconTitle}>
        {TabIcon}
      </div>
    </div>
  );
}
