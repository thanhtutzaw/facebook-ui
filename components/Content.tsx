import { memo, useEffect, useState } from "react";
import { useActive } from "../hooks/useActive";
// import Friend from "./Sections/friend";
const Friend = dynamic(() => import("./Sections/friend"), {
  loading: () => <p>Loading</p>,
});
// const Friend = lazy(() => import("./Sections/friend"));
// const Friend = dynamic(() => import("./Sections/friend"), {
//   loading: () => "Loading...",
// });

import Menu from "./Sections/menu";
import Noti from "./Sections/noti";
import styles from "../styles/Home.module.css";
import { Home } from "./Sections/Home/Home";
import Watch from "./Sections/watch";
import { InferGetServerSidePropsType } from "next";
import { getServerSideProps } from "../pages";
import dynamic from "next/dynamic";
import Profile from "./Sections/profile";
import Tab from "../components/Tab";
type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
// export function Content({ posts }: { posts: Post[] }) {

export function Content(props: Props) {
  // export function Content(
  //   props: InferGetServerSidePropsType<typeof getServerSideProps>
  // )
  const { posts, email } = props;
  const [canDrag, setcanDrag] = useState(false);
  const [pos, setpos] = useState({ top: 0, left: 0, x: 0, y: 0 });
  const { active } = useActive();
  // const router = useRouter();

  // useEffect(() => {
  //   console.log(canDrag)
  //   console.log(router.asPath);
  //   if(canDrag){

  //   }
  // }, [canDrag ,router])

  useEffect(() => {
    if (active) {
      window.location.hash = active === "/" ? "#home" : "#" + active;
    }
    // const content = document.getElementById("content");
    // content?.addEventListener('dragleave' , ()=>{
    //   console.log(active);
    // })
    // content?.addEventListener('click' , ()=>{
    //   console.log(content)
    //   router.push(`${active === "/" ? active : "#" + active}`);
    // })
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
    // if (active) {
    //   router.push(`${active === "/" ? active : "#" + active}`);
    // }
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
      // currentTarget.scrollLeft = dx;
      currentTarget.scrollLeft = pos.left - dx;

      // currentTarget.scrollTop = pos.top - dx;
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
        const indicator = document.getElementsByClassName(
          "Home_indicator__htkkp"
        )[0] as HTMLDivElement;
        indicator.style.transform = `translateX(${scroll / 6}px)`;
      }}
    >
      <Home email={email} posts={posts} />
      <div id="friend" className={styles.add}>
        <Tab active={active} name="friend">
          <Friend />
        </Tab>
      </div>
      <div id="watch" className={styles.profile}>
        <Tab active={active} name="watch">
          <Watch />
        </Tab>
      </div>
      <div id="profile" className={styles.profile}>
        <Tab active={active} name="profile">
          <Profile />
        </Tab>
      </div>
      <div id="noti" className={styles.profile}>
        <Tab active={active} name="noti">
          <Noti />
        </Tab>
      </div>
      <div id="menu" className={styles.profile}>
        <Tab active={active} name="menu">
          <Menu />
        </Tab>
      </div>
    </div>
  );
}
