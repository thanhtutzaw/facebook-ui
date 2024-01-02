import { useActiveTab } from "@/hooks/useActiveTab";
import { ElementType, memo, useEffect, useState } from "react";
import { usePageContext } from "../../context/PageContext";
import styles from "../../styles/Home.module.scss";
import Friends from "./Sections/Friends/Friends";
import Home from "./Sections/Home/Home";
import Menu from "./Sections/Menu/menu";
import Notifications from "./Sections/Notifications/Notifications";
import Profile from "./Sections/Profile";
import Watch from "./Sections/Watch";
import { TabHeader } from "./TabHeader";
// const Friends = dynamic(() => import("./Sections/Friends/Friends"));
// const Profile = dynamic(() => import("./Sections/Profile/index"), {
//   ssr: false,
// });
// const Notifications = dynamic(
//   () => import("./Sections/Notifications/Notifications")
// );
// const Watch = dynamic(() => import("./Sections/Watch"), { ssr: false });
// const Menu = dynamic(() => import("./Sections/Menu/menu"), { ssr: false });

function TabsOld() {
  const [canDrag, setcanDrag] = useState(false);
  const [pos, setpos] = useState({ top: 0, left: 0, x: 0, y: 0 });
  const { indicatorRef, setpreventClick } = usePageContext();
  const { active } = useActiveTab();
  useEffect(() => {
    if (active) {
      window.location.hash = active === "/" ? "home" : `${active}`;
    }
    window.addEventListener("pointerup", () => {
      setcanDrag(false);
    });
  }, [active]);
  useEffect(() => {
    if (!canDrag) return;
    function dragStop() {
      setcanDrag(false);
    }
    window.addEventListener("pointerup", dragStop);
    document.body.addEventListener("pointerup", dragStop);

    return () => {
      document.body.removeEventListener("pointerup", dragStop);
      window.removeEventListener("pointerup", dragStop);
    };
  }, [canDrag]);
  function dragStart(e: React.PointerEvent<HTMLDivElement>) {
    console.log("object");
    e.stopPropagation();
    const currentTarget = e.currentTarget;
    if (e.currentTarget.className == "Home_storyCard__3_T_R") return;
    if (e.currentTarget.tagName == "BODY") return;

    const target = e.target as HTMLElement;
    const event = e as any;
    const tagName = target.tagName.toLowerCase() as ElementType;
    if (
      tagName === "a" ||
      tagName === "dialog" ||
      target.parentElement?.tagName === "DIALOG" ||
      tagName === "button" ||
      tagName === "input"
    )
      return;
    // if (e.target.className == "Home_storyCard__3_T_R") return;
    setpos({
      left: currentTarget.scrollLeft,
      top: currentTarget.scrollTop,
      x: event.clientX,
      y: event.clientY,
    });
    currentTarget.style.transition = "transform 0s  ";
    setcanDrag(true);
    currentTarget.style.cursor = "grabbing";
  }
  function dragStop(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    console.log("stopDrag");
    const event = e as any;
    const currentTarget = e.currentTarget;
    const dx = event.clientX - pos.x;
    if (canDrag) {
      currentTarget.style.cursor = "grab";
      currentTarget.style.transition = "transform .3s ease";
      const dragValue = pos.left - dx;
      const width = currentTarget.clientWidth;
      const middle = width / 2;
      const offset = 10;
      const xOffset = middle - offset,
        yOffset = middle;
      console.log({ width: middle, dragValue });
      if (middle >= dragValue) {
        currentTarget.style.transform = `translateX(${0}px)`;
      } else {
        currentTarget.style.transform = `translateX(-${width * 1}px)`;
      }
      // currentTarget.style.transform = `translateX(-${dragValue}px)`;
    }
    setcanDrag(false);
  }
  function dragging(e: React.PointerEvent<HTMLDivElement>) {
    if (canDrag === true) {
      e.stopPropagation();
      e.preventDefault();
      console.log("dragging");
      const event = e as any;
      const currentTarget = e.currentTarget;
      const dx = event.clientX - pos.x;
      // const dy = e.clientY - pos.y;
      const dragValue = pos.left - dx;
      // const width = currentTarget.clientWidth;
      // console.log({ width: width / 2, dragValue });
      // if (width / 2 >= dragValue) {
      //   currentTarget.style.transform = `translateX(-${0}px)`;
      // }
      currentTarget.style.transform = `translateX(-${dragValue}px)`;
      // currentTarget.scrollLeft = dragValue;
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
      onScroll={(e) => {
        const target = e.target as HTMLDivElement;
        const scroll = target.scrollLeft;
        const indicator = indicatorRef?.current!;
        indicator.style.transform = `translateX(${scroll / 6}px)`;
      }}
    >
      <span
        className="overflow-hidden flex flex-col"
        onPointerDown={dragStart}
        onPointerUp={dragStop}
        onPointerLeave={dragStop}
        onPointerMove={dragging}
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
      </span>
    </div>
  );
}
export default memo(TabsOld);
