import dynamic from "next/dynamic";
import { MouseEvent, useEffect, useState } from "react";
import { useActive } from "../hooks/useActiveTab";
import { Props } from "../pages/index";
import styles from "../styles/Home.module.scss";
import { Home } from "./Sections/Home/Home";
import t from "./Tabs.module.scss";
const Friends = dynamic(() => import("./Sections/Friends/Friends"), {
  ssr: false,
});
const Watch = dynamic(() => import("./Sections/Watch/watch"), { ssr: false });
const Notifications = dynamic(
  () => import("./Sections/Notifications/Notifications")
);
const Profile = dynamic(() => import("./Sections/Profile/Profile"), {
  ssr: false,
});
const Menu = dynamic(() => import("./Sections/Menu/menu"), { ssr: false });

export default function Tabs(props: Props) {
  const { posts, email, indicatorRef } = props;
  const [canDrag, setcanDrag] = useState(false);
  const [pos, setpos] = useState({ top: 0, left: 0, x: 0, y: 0 });
  const { active } = useActive();
  useEffect(() => {
    if (active) {
      window.location.hash = active === "/" ? "#home" : "#" + active;
    }
    window.addEventListener("mouseup", () => {
      setcanDrag(false);
    });
  }, [active, canDrag]);
  function dragStart(e: MouseEvent<HTMLDivElement>) {
    // e.preventDefault();
    e.stopPropagation();
    const currentTarget = e.currentTarget;
    if (e.currentTarget.className == "Home_storyCard__3_T_R") return;
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
    } else {
      setcanDrag(false);
    }
  }
  return (
    <div
      id="tabs"
      role="tabs"
      className={styles.content}
      onMouseDown={(e) => dragStart(e)}
      onMouseUp={(e) => dragStop(e)}
      onMouseMove={(e) => dragging(e)}
      onScroll={(e) => {
        const target = e.target as HTMLDivElement;
        const scroll = target.scrollLeft;
        if (!indicatorRef) return;
        const indicator = indicatorRef.current;
        if (!indicator) return;
        indicator.style.transform = `translateX(${scroll / 6}px)`;
      }}
    >
      <Home canDrag={canDrag} email={email} posts={posts} />
      <div id="friends" className={styles.tab}>
        <div className={t.header}>
          <h2>Friends</h2>
        </div>
        <Friends />
      </div>
      <div id="watch">
        <div className={t.header}>
          <h2>Watch</h2>
        </div>
        <Watch />
      </div>
      <div id="profile">
        <Profile email={email} posts={[]} />
      </div>
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
        <Menu tabIndex={active === "menu" ? 1 : -1} />
      </div>
    </div>
  );
}
