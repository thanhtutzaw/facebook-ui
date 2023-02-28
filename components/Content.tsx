import { useEffect, useState } from "react";
import { useActive } from "../hooks/useActive";
// import Friend from "./Sections/friend";
const Friend = dynamic(() => import("./Sections/friend"), {
  loading: () => <p>Loading</p>,
});
const Watch = dynamic(() => import("./Sections/watch"), {
  loading: () => <p>Loading</p>,
});
const Profile = dynamic(() => import("./Sections/profile"), {
  loading: () => <p>Loading</p>,
});
const Noti = dynamic(() => import("./Sections/noti"), {
  loading: () => <p>Loading</p>,
});
const Menu = dynamic(() => import("./Sections/Menu/menu"), {
  loading: () => <p>Loading</p>,
});

import { InferGetServerSidePropsType } from "next";
import dynamic from "next/dynamic";
import Tab from "../components/Tab";
import { getServerSideProps } from "../pages";
import styles from "../styles/Home.module.scss";
import { Home } from "./Sections/Home/Home";
// type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

// export function Content(props: Props) {
import { Props } from "../pages/index";
export function Content(props: Props) {
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
      id="content"
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

        // const indicator = document.getElementsByClassName(
        //   "Home_indicator__yizMM"
        // )[0] as HTMLDivElement;
        // const indicator = document.getElementsByClassName(
        //   "Home_indicator__htkkp"
        // )[0] as HTMLDivElement;
        // indicator.style.transform =
      }}
    >
      <Home email={email} posts={posts} />
      <div id="friend" className={styles.tab}>
        {/* <a
          style={{ display: "none", pointerEvents: "none" }}
          aria-disabled
          href={`#friend`}
        ></a> */}
        <Tab active={active} name="friend">
          <Friend />
        </Tab>
      </div>
      <div id="watch" className={styles.tab}>
        <Tab active={active} name="watch">
          <Watch />
        </Tab>
      </div>
      <div id="profile" className={styles.tab}>
        <Tab active={active} name="profile">
          <Profile />
        </Tab>
      </div>
      <div id="noti" className={styles.tab}>
        <Tab active={active} name="noti">
          <Noti />
        </Tab>
      </div>
      <div id="menu" className={styles.tab}>
        <Tab active={active} name="menu">
          <Menu />
        </Tab>
      </div>
      {/* <div className={styles.profile}>
      </div> */}
    </div>
  );
}
