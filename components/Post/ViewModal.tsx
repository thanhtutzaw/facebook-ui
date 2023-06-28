import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { animated, useSpring } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { setTimeout } from "timers";
import { PageContext, PageProps } from "../../context/PageContext";
import s from "./Post.module.scss";
export function ViewModal(props: { view: { src: string; name: string } }) {
  const { view } = props;
  const { viewRef } = useContext(PageContext) as PageProps;

  const imgRef = useRef<HTMLImageElement>(null);

  const [drag, setdrag] = useState(false);
  const [visible, setVisible] = useState(true);
  const [{ x, y, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
  }));
  const bind = useGesture(
    {
      onDrag: ({ down, touches, offset: [mx, my], movement: [m], cancel }) => {
        if (touches > 1 && scale.get() === 1) return;
        api.start({
          x: mx,
          y: my,
          immediate: down,
        });
      },
      onDragStart: (state) => {},
      onDragEnd: ({ down, offset: [mx, my] }) => {
        const snap = my >= 150 || my <= -150;
        if (scale.get() > 1) return;
        api.start({
          x: x.get(),
          y: snap
            ? my < 0
              ? -window.innerHeight - 500
              : window.innerHeight + 500
            : scale.get() === 1
            ? 0
            : y.get(),

          immediate: down,
        }),
          setTimeout(() => {
            if (!snap || scale.get() > 1) return;
            viewRef?.current?.close();
          }, 300);
      },
      onPinch: ({ offset: [s, r], cancel }) => {
        const img = imgRef.current!;
        img.style.transition = "transform .1s ease-in-out";

        api.start({
          scale: Math.min(Math.max(1, s), 4),
        });
      },

      onPinchEnd: ({ offset: [s, r] }) => {},
      onDoubleClick: ({ down, event }) => {
        const target = imgRef?.current!;
        const { left, top } = target.getBoundingClientRect();
        const [clientX, clientY] = [event.clientX - left, event.clientY - top];

        const newX = event.clientX - window.innerWidth / 2;
        const newY = event.clientY - window.innerHeight / 2;
        const newScale = scale.get() >= 4 ? 1 : 4;
        const offsetX =
          (event.clientX - window.innerWidth / 2) * (1 - newScale);
        const offsetY =
          (event.clientY - window.innerHeight / 2) * (1 - newScale);
        if (scale.get() >= 4) {
          api.start({ scale: 1, x: 0, y: 0 });
        } else {
          api.start({
            scale: newScale,
            x: offsetX,
            y: offsetY,
            immediate: down,
          });
        }
      },
      onWheel: ({ delta: [, dy], offset: [d1, d2], movement: m, event }) => {
        if (scale.get() < 2) {
          api.start({ x: 0, y: 0 });
        }
        const target = imgRef?.current!;
        const { left, top } = target.getBoundingClientRect();
        const [clientX, clientY] = [event.clientX - left, event.clientY - top];

        const scaleFactor = scale.get() - dy * 0.01;
        api.start({
          scale: Math.min(Math.max(scale.get() + dy * -0.01, 1), 4),
        });
        console.log(event.clientX, event.clientY);
      },

      onWheelStart: (state) => {},
      onWheelEnd: ({ wheeling }) => {
        if (scale.get() <= 1.5) {
          api.start({ x: 0, y: 0, scale: 1 });
        }
      },
    },
    {
      wheel: {
        from: () => [0, 0],
      },
      drag: {
        axis: scale.get() === 1 ? "y" : undefined,
        from: () => [
          scale.get() === 1 ? 0 : x.get(),
          scale.get() === 1 ? 0 : y.get(),
        ],
        bounds: scale.get() === 1 ? {} : {},
        rubberband: true,
      },
      pinch: {
        target: imgRef,
        from: () => [0, 0],
      },
    }
  );
  useEffect(() => {
    // console.log(scale);
    setdrag(false);
  }, [scale, x, y]);

  return (
    <motion.dialog
      onPointerDown={(e) => {
        setdrag(true);
      }}
      onPointerUp={() => {
        setdrag(false);
      }}
      onPointerEnter={() => {
        setdrag(true);
      }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      animate={{
        opacity: viewRef?.current?.open ? 1 : 0,
      }}
      style={{ opacity: 0, transition: "all .2s ease-in-out" }}
      exit={{ opacity: 0 }}
      onClose={(e) => {
        e.currentTarget.style.opacity = "0";
        api.set({ x: 0, y: 0, scale: 1 });
      }}
      className={s.dialog}
      ref={viewRef}
    >
      <AnimatePresence>
        {view.src && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              animate={{
                opacity: visible ? 1 : 0,
              }}
              exit={{ opacity: 0 }}
              className={s.indicator}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img draggable={false} src={view.src} alt={view.name}></img>
              <div
                style={{
                  transition: "all .3s ease-in",
                  backgroundColor: "rgba(0 0 0/.35)",
                }}
              ></div>
              <animated.div
                className={s.mask}
                style={{
                  scale: 1 / scale.get(),
                  x: 2 / x.get(),
                  y: 2 / x.get(),
                  border: "2px solid white",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  draggable={false}
                  className={s.indicator}
                  style={{
                    opacity: "0",
                  }}
                  src={view.src}
                  alt={view.name}
                ></img>
              </animated.div>
            </motion.div>
            <div style={{ height: "100%" }}>
              <AnimatePresence>
                {!visible && (
                  <form method="dialog">
                    <motion.button
                      initial={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      animate={{
                        opacity: !visible ? 1 : 0,
                      }}
                      exit={{ opacity: 0 }}
                      title="Close"
                      aria-label="Close Photo View modal"
                      tabIndex={-1}
                      className={s.closeDialog}
                    >
                      <FontAwesomeIcon icon={faClose} />
                    </motion.button>
                  </form>
                )}
              </AnimatePresence>
              <animated.div
                {...bind()}
                draggable={false}
                style={{
                  touchAction: "none",
                  position: "fixed",
                  inset: "0",
                  width: "100%",
                  height: "100%",

                  scale,
                  x,
                  y,
                  transformOrigin: "center center",
                }}
                ref={imgRef}
              >
                {view.src && (
                  <Image
                    style={{ touchAction: "none" }}
                    priority={false}
                    draggable={false}
                    fill
                    src={view.src}
                    alt={view.name}
                  ></Image>
                )}
              </animated.div>
              {/* <h1
            style={{
              color: "var(--blue-origin)",
              position: "fixed",
              zIndex: "1000",
              left: "0",
              background: "white",
              pointerEvents: "none",
            }}
          >
            s:{scale.get()} ; x: {Math.floor(x.get())} y: {Math.floor(y.get())}
          </h1> */}
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.dialog>
  );
}
