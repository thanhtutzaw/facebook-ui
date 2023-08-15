import dynamic from "next/dynamic";
import { MouseEvent, RefObject, useContext, useEffect, useState } from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import styles from "../../styles/Home.module.scss";
import Home from "../Sections/Home/Home";
import t from "./Tabs.module.scss";
import { AppContext } from "../../context/AppContext";
import { Props } from "../../types/interfaces";
import { useActive } from "../../hooks/useActiveTab";
const Friends = dynamic(() => import("../Sections/Friends/Friends"), {
  ssr: false,
});
const Watch = dynamic(() => import("../Sections/Watch"), { ssr: false });
const Profile = dynamic(() => import("../Sections/Profile"), {
  ssr: false,
});
const Notifications = dynamic(
  () => import("../Sections/Notifications/Notifications")
);
const Menu = dynamic(() => import("../Sections/Menu/menu"), { ssr: false });

export default function Tabs(props: {
  indicatorRef: RefObject<HTMLDivElement>;
}) {
  const { indicatorRef } = props;
  const [canDrag, setcanDrag] = useState(false);
  const [pos, setpos] = useState({ top: 0, left: 0, x: 0, y: 0 });
  const { setpreventClick } = useContext(PageContext) as PageProps;
  // const { active } = useContext(AppContext) as Props;
  const { active } = useActive();

  useEffect(() => {
    if (!active) return;
    window.location.hash = active === "/" ? "#home" : `#${active}`;
  }, [active]);
  useEffect(() => {
    function dragStop() {
      setcanDrag(false);
    }
    window.addEventListener("mouseup", dragStop);
    document.body.addEventListener("mouseup", dragStop);

    return () => {
      document.body.removeEventListener("mouseup", dragStop);
      window.removeEventListener("mouseup", dragStop);
    };
  }, []);
  function dragStart(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    const currentTarget = e.currentTarget;
    if (e.currentTarget.className == "Home_storyCard__3_T_R") return;
    if (e.currentTarget.tagName == "BODY") return;

    const target = e.target as HTMLElement;
    if (target.tagName === "A") return;
    // console.log(target.tagName);
    // console.log("drag start");
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
      // className={active === '/' ? styles.content : styles.acitveTab}
      className={styles.content}
      onMouseDown={(e) => dragStart(e)}
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
      <div id="friends" className={styles.tab}>
        <div style={{paddingBottom:'0'}} className={t.header}>
          <h2>Friends</h2>
        </div>
        <Friends tabIndex={active === "friends" ? 0 : -1} />
      </div>
      <div id="watch">
        <div className={t.header}>
          <h2>Watch</h2>
        </div>
        <Watch />
      </div>

      <Profile />
      <div id="notifications">
        <div className={t.header}>
          <h2>Notifications</h2>
        </div>
        <Notifications />
      </div>
      <div id="menu">
        <div className={t.header}>
          <h2>Menu</h2>
        </div>
        <Menu tabIndex={active === "menu" ? 0 : -1} />
      </div>
    </div>
  );
}
