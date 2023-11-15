import { AppContext } from "@/context/AppContext";
import { AppProps } from "@/types/interfaces";
import dynamic from "next/dynamic";
import {
  ElementType,
  MouseEvent,
  memo,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import { useActive } from "../../hooks/useActiveTab";
import styles from "../../styles/Home.module.scss";
import Home from "./Sections/Home/Home";
import Notifications from "./Sections/Notifications/Notifications";
import Profile from "./Sections/Profile";
import { TabHeader } from "./TabHeader";
const Friends = dynamic(() => import("./Sections/Friends/Friends"), {
  ssr: false,
});
const Watch = dynamic(() => import("./Sections/Watch"), { ssr: false });
// const Profile = dynamic(() => import("./Sections/Profile/index"), {
//   ssr: false,
// });
// const Notifications = dynamic(
//   () => import("./Sections/Notifications/Notifications")
// );
const Menu = dynamic(() => import("./Sections/Menu/menu"), { ssr: false });

function Tabs() {
  const [canDrag, setcanDrag] = useState(false);
  const [pos, setpos] = useState({ top: 0, left: 0, x: 0, y: 0 });
  const { indicatorRef, setpreventClick } = useContext(
    PageContext
  ) as PageProps;
  const { headerContainerRef } = useContext(AppContext) as AppProps;
  const { active } = useActive();
  const headerContainer = headerContainerRef?.current;
  useLayoutEffect(() => {
    const tabs = document.getElementById("tabs");
    const main = document.getElementsByTagName("main")[0];

    console.log("in appContext" + headerContainer);
    if (window.location.hash === "" || window.location.hash === "#home") {
      if (!headerContainer) return;
      headerContainer.style.transform = "translateY(0px)";
      headerContainer.style.height = "120px";
      // main.scrollTo({
      //   top: 0,
      //   behavior: "smooth",
      // });
      tabs?.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    }
    window.onhashchange = (e) => {
      if (window.location.hash === "" || window.location.hash === "#home") {
        tabs?.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        main.style.scrollSnapType = "none";
        if (!headerContainer) return;
        headerContainer.style.transform = "translateY(-60px)";
        headerContainer.style.height = "60px";
      }
    };
  }, [headerContainer, active]);
  useEffect(() => {
    if (!active) return;
    window.location.hash = active === "/" ? "#home" : `#${active}`;
  }, [active]);

  useEffect(() => {
    if (!canDrag) return;
    function dragStop() {
      setcanDrag(false);
    }
    window.addEventListener("mouseup", dragStop);
    document.body.addEventListener("mouseup", dragStop);

    return () => {
      document.body.removeEventListener("mouseup", dragStop);
      window.removeEventListener("mouseup", dragStop);
    };
  }, [canDrag]);
  function dragStart(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    const currentTarget = e.currentTarget;
    if (e.currentTarget.className == "Home_storyCard__3_T_R") return;
    if (e.currentTarget.tagName == "BODY") return;

    const target = e.target as HTMLElement;
    const tagName = target.tagName.toLowerCase() as ElementType;
    if (
      tagName === "a" ||
      tagName === "dialog" ||
      target.parentElement?.tagName === "DIALOG" ||
      tagName === "button"
    )
      return;
    // if (e.target.className == "Home_storyCard__3_T_R") return;
    setpos({
      left: currentTarget.scrollLeft,
      top: currentTarget.scrollTop,
      x: e.clientX,
      y: e.clientY,
    });
    setcanDrag(true);
    currentTarget.style.cursor = "grabbing";
  }
  function dragStop(e: MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const currentTarget = e.currentTarget;
    if (canDrag) {
      currentTarget.style.cursor = "grab";
    }
    setcanDrag(false);
  }
  function dragging(e: MouseEvent<HTMLDivElement>) {
    if (canDrag === true) {
      e.stopPropagation();
      e.preventDefault();
      const currentTarget = e.currentTarget;
      const dx = e.clientX - pos.x;
      // const dy = e.clientY - pos.y;
      currentTarget.scrollLeft = pos.left - dx;
      setpreventClick?.(true);
      // if (!preventClick) return;
      // preventClick.current = true;
    } else {
      setcanDrag(false);
      setpreventClick?.(false);
      // if (!preventClick) return;
      // preventClick.current = false;
    }
  }
  return (
    <div
      id="tabs"
      className={styles.content}
      onMouseDown={(e) => {
        dragStart(e);
      }}
      onMouseUp={(e) => dragStop(e)}
      onMouseMove={(e) => dragging(e)}
      onScroll={(e) => {
        const target = e.target as HTMLDivElement;
        const scroll = target.scrollLeft;
        const indicator = indicatorRef?.current!;
        indicator.style.transform = `translateX(${scroll / 6}px)`;
      }}
    >
      <Home tabIndex={active === "/" ? 0 : -1} />
      <div
        aria-hidden={active !== "friends"}
        id="friends"
        className={styles.tab}
      >
        <TabHeader>Friends</TabHeader>
        <Friends tabIndex={active === "friends" ? 0 : -1} />
      </div>
      <div aria-hidden={active !== "watch"} id="watch">
        <TabHeader>Watch</TabHeader>
        <Watch />
      </div>
      <Profile tabIndex={active === "profile" ? 0 : -1} />
      <Notifications tabIndex={active === "notifications" ? 0 : -1} />
      <div aria-hidden={active !== "menu"} id="menu">
        <TabHeader>Menu</TabHeader>
        <Menu tabIndex={active === "menu" ? 0 : -1} />
      </div>
    </div>
  );
}
export default memo(Tabs);
