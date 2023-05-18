import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MouseEvent, memo, useEffect, useRef, useState } from "react";
import styles from "../../../styles/Home.module.scss";
import { InferGetServerSidePropsType } from "next";
import { getServerSideProps } from "../../../pages";
import Image from "next/image";
type StoryProps = InferGetServerSidePropsType<typeof getServerSideProps>;
export default function Story({ email }: StoryProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [draggable, setdraggable] = useState(false);
  const [pos, setpos] = useState({ top: 0, left: 0, x: 0, y: 0 });
  const [prevPoint, setprevPoint] = useState<number>(pos.x);
  const [Percentage, setPercentage] = useState<number>();
  const [scroll, setscroll] = useState<number>();
  useEffect(() => {
    // const startPoint = scroll! < 50;
    // const centerPoint = scroll! > 1 && scroll! < 80;
    // if (scroll! < 50) {
    //   container.scrollLeft = 0;
    // } else if (centerPoint) {
    //   container.scrollLeft = 80;
    // }
    // if (scroll! < 15) {
    //   container.scrollLeft = 0;
    // } else if (scroll! > 15 && scroll! < 80) {
    //   container.scrollLeft = 80;
    // }

    // window.addEventListener("mouseup", () => {
    //   // setdraggable(false);
    //   console.log("window mouseup");
    // });
    function dragStop() {
      if (!email) return;
      console.log("body mouseup");
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
    // target.style.cursor = "grabbing !important";
    target.style.scrollBehavior = "initial";
    target.style.cursor = "grabbing";
    setdraggable(true);
    // target.style.cursor = "grabbing !important"
    setpos({
      ...pos,
      left: target.scrollLeft,
      // top: e.clientX,
      // left: e.clientX,
      x: e.clientX,
      // y: e.clientY,
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
    // setpos({
    //   ...pos,
    //   x:0
    // })

    // setprevPoint(pos.x)
    // setpos({
    //   ...pos,
    // });
    // setprevPoint(e.clientX)
    if (e.pageX > 300 || e.pageX < 500) {
      // target.style.transform = `translateX(0px)`;
    }
    // console.log(e.pageX < 464);
    // console.log(e.pageX);
    // target.style.transition = `all .2s ease`;
  }
  function doScrollSnap(target: HTMLDivElement) {
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
    doScrollSnap(target);
    // if (e.pageX > 300 || e.pageX < 500) {
    //   target.style.transform = `translateX(0px)`;
    // }
    if (draggable === true) {
      document.body.style.userSelect = "none";
      const maxDelta = window.innerWidth / 2;
      // target.style.transform = `translateX(${e.clientX / 10}px)`;
      const dx = e.clientX - pos.x;
      target.scrollLeft = pos.left - dx;
      const percentage = (dx / maxDelta) * 100;
      const nextPrecentageOrigin = percentage + prevPoint;
      const nextPrecentage = Math.max(Math.min(nextPrecentageOrigin, 0), -30);
      setPercentage(nextPrecentage);
      // target.style.transform = `translateX(${nextPrecentage}%)`;

      // if (e.clientX <= 365) {
      //   setdraggable(false);
      //   target.style.transform = `translateX(0px)`;
      // }
    } else {
      setdraggable(false);
      document.body.style.userSelect = "initial";
    }
    // target.style.transform = `translateX(0px)`;
  }

  return (
    <div className={styles.storyContainer}>
      <div
        // onClick={(e)=>{
        //   const target = e.currentTarget;
        //   console.log(target)
        //   target.scrollLeft += 200
        // }}
        // style={{ scrollSnapType: "x mandatory", transform: "translateX(0px)" }}
        onMouseDown={dragStart}
        onMouseUp={drageStop}
        onMouseMove={dragging}
        onTouchMove={(e) => {
          const target = e.currentTarget;
          // const scroll = target.scrollLeft;
          target.style.scrollBehavior = "smooth";
          // target.style.scrollSnapStop = 'always'
          doScrollSnap(target);
        }}
        onScroll={(e) => {
          // const target = e.currentTarget;
          // const scroll = target.scrollLeft;
          // setscroll(scroll);
          // const
          // lessthan15 = scroll < 15 ,
          // between15and80 = scroll >15 && scroll < 80  ,
          // lessthan80 = scroll < 80
          // console.log(scroll)
          // console.log(lessthan15 ||  lessthan80);
          // const canScroll = scroll >= 82;
          // console.log(canScroll);
          // if (scroll < 58) {
          // target.scrollLeft = 0
          // target.style.scrollBehavior = 'smooth'
          // }
          // if (scroll >= 58) {
          // target.scrollLeft = 99;
          // target.style.removeProperty("scroll-snap-type");
          // target.style.scrollSnapType = "unset"
          // console.log(target.re);
          // } else if (scroll <= 83) {
          // target.style.scrollSnapType = "x mandatory";
          // }
          // target.style.setProperty('scroll-snap-type', 'x mandatory')
        }}
        // e.currentTarget.style.transform = `translateX(${e.clientX * 0}px)`;
        // onDragEnter={
        //   ()=>{console.log("dragging")}
        // }
        // e.currentTarget.style.transform = `translateX(${e.clientX * 10}px)`;
        className={styles.storyCards}
      >
        <div
          // onClick={() => fileInput.current?.click()}
          className={`${styles.storyCard} ${styles.addStory}`}
        >
          <div className={styles.storyProfile}>
            <Image
              // className={s.profile}
              alt={email || ""}
              width={95}
              height={105}
              src={
                email === "testuser@gmail.com"
                  ? "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
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
          <div className={styles.storyCard}></div>
          <div className={styles.storyCard}></div>
          <div className={styles.storyCard}></div>
          <div className={styles.storyCard}></div>
          <div className={styles.storyCard}></div>
        </div>
      </div>
    </div>
  );
}
