import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InferGetServerSidePropsType } from "next";
import Image from "next/image";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { getServerSideProps } from "../../../../pages";
import styles from "../../../../styles/Home.module.scss";
import Card from "./Card";
type StoryProps = InferGetServerSidePropsType<typeof getServerSideProps>;
export default function Story({ email }: StoryProps) {
  const photoURL = "";
  const fileInput = useRef<HTMLInputElement>(null);
  const [draggable, setdraggable] = useState(false);
  const [pos, setpos] = useState({ top: 0, left: 0, x: 0, y: 0 });
  const [prevPoint, setprevPoint] = useState<number>(pos.x);
  const [Percentage, setPercentage] = useState<number>();
  const [scroll, setscroll] = useState<number>();
  useEffect(() => {
    function dragStop() {
      if (!email) return;
      setdraggable(false);
      setprevPoint(Percentage!);
    }
    document.body.addEventListener("mouseup", dragStop);

    return () => {
      document.body.removeEventListener("mouseup", dragStop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggable]);

  function dragStart(e: MouseEvent) {
    e.stopPropagation();
    const target = e.currentTarget as HTMLDivElement;
    target.style.scrollBehavior = "initial";
    target.style.cursor = "grabbing";
    setdraggable(true);
    setpos({
      ...pos,
      left: target.scrollLeft,
      x: e.clientX,
    });
  }
  function drageStop(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const target = e.currentTarget as HTMLDivElement;

    target.style.cursor = "grab";
    target.style.scrollBehavior = "smooth";
    setprevPoint(Percentage!);
    setdraggable(false);
  }
  function scrollSnap(target: HTMLDivElement) {
    if (scroll! < 0) {
      target.scrollLeft = 0;
    } else if (scroll! > 0 && scroll! < 80) {
      target.scrollLeft = 80;
    }
  }
  function dragging(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const target = e.currentTarget as HTMLDivElement;
    scrollSnap(target);
    if (draggable === true) {
      document.body.style.userSelect = "none";
      const maxDelta = window.innerWidth / 2;
      const dx = e.clientX - pos.x;
      target.scrollLeft = pos.left - dx;
      const percentage = (dx / maxDelta) * 100;
      const nextPrecentageOrigin = percentage + prevPoint;
      const nextPrecentage = Math.max(Math.min(nextPrecentageOrigin, 0), -30);
      setPercentage(nextPrecentage);
      // target.style.transform = `translateX(${nextPrecentage}%)`;
    } else {
      setdraggable(false);
      document.body.style.userSelect = "initial";
    }
  }

  return (
    <div className={styles.storyContainer}>
      <div
        onMouseDown={dragStart}
        onMouseUp={drageStop}
        onMouseMove={dragging}
        onTouchMove={(e) => {
          const target = e.currentTarget;
          target.style.scrollBehavior = "smooth";
          scrollSnap(target);
        }}
        className={styles.storyCards}
      >
        <div
          // onClick={() => fileInput.current?.click()}
          className={`${styles.storyCard} ${styles.addStory}`}
        >
          <div className={styles.storyProfile}>
            <Image
              priority={true}
              width={150}
              height={170}
              style={{ objectFit: "cover", width: "100%", height: "105px" }}
              alt={email || ""}
              src={
                email === "testuser@gmail.com"
                  ? "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
                  : photoURL
                  ? photoURL
                  : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
              }
            />
          </div>

          <input
            style={{ display: "none", visibility: "hidden" }}
            ref={fileInput}
            type="file"
          />
          <button tabIndex={-1}>
            <FontAwesomeIcon icon={faAdd} />
          </button>
          <p>Create Story</p>
        </div>

        <div className={styles.cardContainer}>
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
        </div>
      </div>
    </div>
  );
}
