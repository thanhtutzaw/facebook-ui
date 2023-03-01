import { useEffect, useState } from "react";
import { useActive } from "../hooks/useActive";
const Friends = dynamic(() => import("./Sections/Friends/Friends"));
const Watch = dynamic(() => import("./Sections/Watch/watch"));
const Notifications = dynamic(
  () => import("./Sections/Notifications/Notifications")
);
const Menu = dynamic(() => import("./Sections/Menu/menu"));
// type TabComponents = {
//   [key: string]: React.ComponentType<{}>;
// };
// const tabsComponent = {
//   Friends,
//   Watch,
//   Profile,
//   Notifications,
//   Menu,
// };
import dynamic from "next/dynamic";
import Tab from "./Tab";
import styles from "../styles/Home.module.scss";

import t from "./Tabs.module.scss";

import { Home } from "./Sections/Home/Home";
// type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

// export function Content(props: Props) {
import { Props } from "../pages/index";
import Profile from "./Sections/Profile/Profile";
// import Menu from "./Sections/Menu/menu";
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

  function dragStart(e: any) {
    e.preventDefault();
    e.stopPropagation();

    const currentTarget = e.currentTarget;
    if (e.target.className == "Home_storyCard__3_T_R") return;
    setpos({
      left: currentTarget.scrollLeft,
      top: currentTarget.scrollTop,
      x: e.clientX,
      y: e.clientY,
    });
    setcanDrag(true);
    currentTarget.style.cursor = "grabbing";
  }
  function dragStop(e: any) {
    e.preventDefault();
    e.stopPropagation();
    const currentTarget = e.currentTarget;
    if (canDrag) {
      currentTarget.style.cursor = "grab";
    }
    setcanDrag(false);
  }
  function dragging(e: any) {
    if (canDrag === true) {
      e.stopPropagation();
      e.preventDefault();
      const currentTarget = e.currentTarget as HTMLDivElement;
      const dx = e.clientX - pos.x;
      const dy = e.clientY - pos.y;
      currentTarget.scrollLeft = pos.left - dx;
    } else {
      setcanDrag(false);
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
        if (!indicatorRef) return;
        const indicator = indicatorRef.current;
        if (!indicator) return;
        indicator.style.transform = `translateX(${scroll / 6}px)`;
      }}
    >
      <Home email={email} posts={posts} />
      {/* {pages.map((page, index) => {
        const pageLower = page.name.toLowerCase();
        const name = page.name;
        const Component = tabsComponent[name];
        return (
          <div key={index} id={pageLower} className={styles.tab}>
            <Tab active={active} name={pageLower}>
              <Component />
            </Tab>
          </div>
        );
      })} */}
      <div id="friends" className={styles.tab}>
        <Tab active={active} name="friends">
          <>
            <div className={t.header}>
              <h2>Friends</h2>
            </div>
            <Friends />
          </>
        </Tab>
      </div>
      <div id="watch">
        <Tab active={active} name="watch">
          <>
            <div className={t.header}>
              <h2>Watch</h2>
            </div>
            <Watch />
          </>
        </Tab>
      </div>
      <div id="profile">
        <Tab active={active} name="profile">
          <Profile email={email} posts={[]} />
        </Tab>
      </div>
      <div id="notifications">
        <Tab active={active} name="notifications">
          <>
            <div className={t.header}>
              <h2>Notifications</h2>
            </div>
            <Notifications />
          </>
        </Tab>
      </div>
      <div id="menu">
        {/* <Tab active={active} name="menu"> */}
          <>
            <div className={t.header}>
              <h2>Menu</h2>
            </div>
            <Menu />
          </>
        {/* </Tab> */}
      </div>
    </div>
  );
}
