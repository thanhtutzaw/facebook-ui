import Friend from "../pages/friend";
import styles from "../styles/Home.module.css";
import Profile from "../pages/profile";
import Watch from "../pages/watch";
import Menu from "../pages/menu";
import Noti from "../pages/noti";
import { useEffect, useRef, useState } from "react";
import useActive from "../hooks/useActive";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAdd
} from "@fortawesome/free-solid-svg-icons";
import Newfeed from "./Newfeed";
function Story() {
  const fileInput = useRef<HTMLInputElement>(null)
  return (
    <div className={styles.storyContainer}>
      <div className={styles.storyCards}>
        <div
          onClick={() => {
            fileInput.current?.click();
          }}
          className={[styles.storyCard, styles.addStory].join(" ")}
        >
          <input
            style={{ display: "none", visibility: "hidden" }}
            ref={fileInput}
            type="file"
          />
          <button>
            <FontAwesomeIcon icon={faAdd} />
          </button>
          <p>Create Story</p>
        </div>
        <div className={styles.storyCard}></div>
        <div className={styles.storyCard}></div>
        <div className={styles.storyCard}></div>
        <div className={styles.storyCard}></div>
        <div className={styles.storyCard}></div>
      </div>
    </div>
  );
}

export function Content(props:any) {
  const {posts} = props;
  const [canDrag, setcanDrag] = useState(false);
  const [pos, setpos] = useState({ top: 0, left: 0, x: 0, y: 0 });
  const { active } = useActive();
  const router = useRouter();

  // useEffect(() => {
  //   console.log(canDrag)
  //   console.log(router.asPath);
  //   if(canDrag){

  //   }
  // }, [canDrag ,router])

  useEffect(() => {
    // console.log(active);
    if (active) {
      window.location.hash = active === "/" ? "#home" : "#" + active;
    }
    const content = document.getElementById("content");
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
    // if(e.target.class)
    console.log()
    if (e.target.className == "Home_storyCard__3_T_R")return ;
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
      <div id="/" className={styles.home}>
        <Story />
        <Newfeed posts={posts}/>
      </div>
      <Friend />
      <Watch />
      <Profile />
      <Noti />
      <Menu />
    </div>
  );
}
