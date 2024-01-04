import { useAppContext } from "@/context/AppContext";
import { useActiveTab } from "@/hooks/useActiveTab";
import {
  ElementType,
  MouseEvent,
  memo,
  useEffect,
  useState
} from "react";
import { usePageContext } from "../../context/PageContext";
import styles from "../../styles/Home.module.scss";
import Friends from "./Sections/Friends/Friends";
import Home from "./Sections/Home/Home";
import Menu from "./Sections/Menu/menu";
import Notifications from "./Sections/Notifications/Notifications";
import Profile from "./Sections/Profile";
import Watch from "./Sections/Watch";
import { TabHeader } from "./TabHeader";
import { Post } from "@/types/interfaces";
import { useNewsFeedContext } from "@/context/NewsFeedContext";
// const Friends = dynamic(() => import("./Sections/Friends/Friends"));
// const Profile = dynamic(() => import("./Sections/Profile/index"), {
//   ssr: false,
// });
// const Notifications = dynamic(
//   () => import("./Sections/Notifications/Notifications")
// );
// const Watch = dynamic(() => import("./Sections/Watch"), { ssr: false });
// const Menu = dynamic(() => import("./Sections/Menu/menu"), { ssr: false });

function Tabs() {
  const [canDrag, setcanDrag] = useState(false);
  // const { newsFeedPost, deletePost } = useNewsFeedContext();
  const [pos, setpos] = useState({ top: 0, left: 0, x: 0, y: 0 });
  const { indicatorRef, setpreventClick } = usePageContext();
  const { headerContainerRef } = useAppContext();
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
    currentTarget.style.cursor = "grabbing";
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
  }
  function dragStop(e: MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const currentTarget = e.currentTarget;
    if (canDrag) {
      currentTarget.style.cursor = "grab";
    }
    // currentTarget.style.scrollBehavior = "smooth";
    setcanDrag(false);
  }
  function dragging(e: MouseEvent<HTMLDivElement>) {
    if (canDrag === true) {
      e.stopPropagation();
      e.preventDefault();
      const currentTarget = e.currentTarget;
      currentTarget.style.cursor = "grabbing";
      const dx = e.clientX - pos.x;
      // const dy = e.clientY - pos.y;
      currentTarget.scrollLeft = pos.left - dx * 2;
      setpreventClick?.(true);
    } else {
      setcanDrag(false);
      setpreventClick?.(false);
    }
  }
  const headerContainer = headerContainerRef && headerContainerRef?.current;
  const hideHeader = () => {
    if (!headerContainer) return;
    headerContainer.setAttribute("data-hide", "true");
  };
  const showHeader = () => {
    if (!headerContainer) return;
    headerContainer.setAttribute("data-hide", "false");
  };
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
        // console.log(target.scrollLeft >= target.clientWidth / 2);
        // const isHide = headerContainer?.getAttribute("data-hide");
        // const homeVisible = target.scrollLeft <= target.clientWidth / 2;
        // const otherTab = target.scrollLeft >= target.clientWidth;
        // const scrollToOtherTab = target.scrollLeft >= target.clientWidth / 2;
        // let fromOtherTab = false;
        // console.log({ homeVisible });

        // if hide or notHide hideHeader and do not run showHeader
        // if (homeVisible) {
        //   // if (isHide) return;
        //   showHeader(); // how to write if hide just do nothing but if not hide show it .
        // } else if (scrollToOtherTab) {
        //   if (otherTab && isHide) return;
        //   console.error("header hided");
        //   fromOtherTab = true;
        //   hideHeader();
        // }
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
