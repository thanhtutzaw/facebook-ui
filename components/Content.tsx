import Friend from "../pages/friend";
import styles from "../styles/Home.module.css";
import Profile from "../pages/profile";
import Watch from "../pages/watch";
import Menu from "../pages/menu";
import Noti from "../pages/noti";
import { useEffect, useState } from "react";

function Story() {
  return <div className={styles.storyContainer}>Story</div>;
}
function Posts() {
  return <div className={styles.postContainer}>Posts</div>;
}

export function Content() {
  const [canDrag, setcanDrag] = useState(false);
  const [pos, setpos] = useState({ top: 0, left: 0, x: 0, y: 0 });

  useEffect(() => {
    window.addEventListener("mouseup", () => {
      setcanDrag(false);
    });
  }, []);

  function dragStart(e: any) {
    e.preventDefault();
    e.stopPropagation();
    const currentTarget = e.currentTarget;
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
    >
      <div id="/" className={styles.home}>
        <Story />
        <Posts />
      </div>
      <Friend />
      <Watch />
      <Profile />
      <Noti />
      <Menu />
    </div>
  );
}