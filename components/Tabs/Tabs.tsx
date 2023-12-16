import { AppContext } from "@/context/AppContext";
import { useActiveTab } from "@/hooks/useActiveTab";
import { AppProps } from "@/types/interfaces";
import dynamic from "next/dynamic";
import {
  ElementType,
  MouseEvent,
  memo,
  useContext,
  useEffect,
  useState,
} from "react";
import { PageContext, PageProps } from "../../context/PageContext";
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
  // const { active } = useContext(AppContext) as AppProps;
  const { active } = useActiveTab();
  useEffect(() => {
    if (active) {
      window.location.hash = active === "/" ? "home" : `${active}`;
      // router.push({ hash: active === "/" ? "#home" : `#${active}` });
    }
    window.addEventListener("mouseup", () => {
      setcanDrag(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } else {
      setcanDrag(false);
      setpreventClick?.(false);
    }
  }
  return (
    <div
      id="tabs"
      className={styles.content}
      onMouseDown={dragStart}
      onMouseUp={dragStop}
      onMouseMove={dragging}
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
        tabIndex={active === "friends" ? 0 : -1}
        id="friends"
        className={styles.tab}
      >
        <TabHeader>Friends</TabHeader>
        <Friends tabIndex={active === "friends" ? 0 : -1} />
      </div>

      <div
        aria-hidden={active !== "watch"}
        tabIndex={active === "watch" ? 0 : -1}
        id="watch"
      >
        <TabHeader>Watch</TabHeader>
        <Watch />
      </div>
      <Profile tabIndex={active === "profile" ? 0 : -1} />
      <Notifications tabIndex={active === "notifications" ? 0 : -1} />
      <div
        aria-hidden={active !== "menu"}
        tabIndex={active === "menu" ? 0 : -1}
        id="menu"
      >
        <TabHeader>Menu</TabHeader>
        <Menu tabIndex={active === "menu" ? 0 : -1} />
      </div>
    </div>
  );
}
export default memo(Tabs);
