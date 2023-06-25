/* eslint-disable @next/next/no-img-element */
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { animated, useSpring } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { setTimeout } from "timers";
import Image from "next/image";
import { PageContext, PageProps } from "../../context/PageContext";
import s from "./Post.module.scss";
export function ViewModal(props: { view: { src: string; name: string } }) {
  const { view } = props;
  const { viewRef } = useContext(PageContext) as PageProps;
  // const [scalevalue, setscalevalue] = useState(-100);
  const [zoom, setZoom] = useState({ scale: 1 });
  const imgRef = useRef<HTMLImageElement>(null);
  const [start, setstart] = useState({ x: 0, y: 0 });
  const [point, setpoint] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [hovered, sethovered] = useState(false);
  const [{ x, y }, api] = useSpring(() => ({
    x: 0,
    y: 0,
  }));
  const bind = useGesture(
    {
      onDrag: ({ down, touches, offset: [mx, my], movement: [m], cancel }) => {
        if (touches > 1 && zoom.scale === 1) return;
        if (zoom.scale === 1) {
          // setZoom({ scale: 5 });
          // api.start({
          //   y: 100,
          //   immediate: down,
          // });
        }
        // if (zoom.scale === 1) return;
        // console.log({ mx, my, m });
        api.start({
          x: mx,
          y: my,
          immediate: down,
        }),
          {
            // axis: "y",
            // bounds: { left: -500, right: 500, top: -500, bottom: 500 },
            // rubberband: true,
          };
      },
      onDragStart: (state) => {},
      onDragEnd: ({ down, offset: [mx, my] }) => {
        const snap = my >= 300 || my <= -300;
        api.start({
          x: my > 800 ? 0 : x.get(),
          y:
            snap && zoom.scale === 1
              ? my < 0
                ? -window.innerHeight - 500
                : window.innerHeight + 500
              : zoom.scale === 1
              ? 0
              : y.get(),
          // y: snap && zoom.scale === 1 ? 1000 : y.get(),
          // x: mx > 800 ? 0 : x.get(),
          // y: my > -800 ? 0 : x.get(),
          immediate: down,
        }),
          setTimeout(() => {
            if (!snap || zoom.scale > 1) return;
            // if (zoom.scale > 1) return;
            viewRef?.current?.close();
          }, 300);
        {
          // axis: "y",
          // bounds: { left: -500, right: 500, top: -500, bottom: 500 },
          // rubberband: true,
        }
      },
      onPinch: ({ offset: [s, r], cancel }) => {
        const img = imgRef.current!;
        img.style.transition = "initial";
        // console.log(state);
        // const {
        //   da, // [d,a] absolute distance and angle of the two pointers
        //   origin, // coordinates of the center between the two touch event
        //   offset, // [scale, angle] offsets (starts withs scale=1)
        // } = state;
        // console.log(offset);
        setZoom({
          ...zoom,
          // scale: s <= 1.99 ? 1 : Math.min(Math.max(1, s), 4),
          scale: parseFloat(Math.min(Math.max(1, s), 4).toFixed(1)),
        });
      },
      // onPinchStart: (state) => {
      //   console.log(state);
      // },
      onPinchEnd: ({ offset: [s, r] }) => {
        const img = imgRef.current!;
        img.style.transition = "transform 0.3s ease-in-out";
        setZoom({
          ...zoom,
          // scale: s <= 1.99 ? 1 : Math.min(Math.max(1, s), 4),
          scale: s <= 1.99 ? 1 : Math.min(Math.max(1, s), 4),
        });
      },

      // onWheel: ({ down, offset: [d1, d2] }) => {
      //   setVisible(true);
      //   // if (d2 > -100) return;
      //   console.log(d2);
      //   setscalevalue((s) => d2);
      //   // api.start({
      //   //   scale: d2,
      //   // }),
      // },
      onWheelStart: (state) => {},
      onWheelEnd: (state) => {},
    },
    {
      // ...sharedOptions,
      drag: {
        axis: zoom.scale === 1 ? "y" : undefined,
        from: () => [
          zoom.scale === 1 ? 0 : x.get(),
          zoom.scale === 1 ? 0 : y.get(),
        ],
        // rubberband: true,
      },
      // wheel: wheelOptions,
      pinch: {
        target: imgRef,
        from: () => [
          zoom.scale === 1 ? 1 : zoom.scale,
          zoom.scale === 1 ? 0 : y.get(),
        ],
        // from: () => (zoom.scale === 1 ? 0 : zoom.scale),
      },
    }
  );
  // const bind = useDrag(({ down, movement: [mx, my] }) => {
  //   api.start({ x: down ? mx : 0, y: down ? my : 0, immediate: down }),
  //     {
  //       bounds: { left: -500, right: 500, top: -500, bottom: 500 },
  //       rubberband: true,
  //     };
  // });
  useEffect(() => {
    let timeoutId: string | number | NodeJS.Timeout | undefined;

    if (visible) {
      if (zoom.scale === 1) {
        api.start({
          x: 0,
          y: 0,
        });
        setTimeout(() => {
          setVisible(false);
        }, 500);
      }
      if (hovered) {
        setVisible(true);
        if (zoom.scale === 1) {
          setTimeout(() => {
            setVisible(false);
          }, 500);
        }

        clearTimeout(timeoutId);
        return;
      }
      timeoutId = setTimeout(() => {
        setVisible(false);
      }, 500);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [api, hovered, visible, zoom.scale]);
  const [canDrag, setcanDrag] = useState(false);
  useEffect(() => {
    const cancelDrag = () => {
      if (!canDrag) return;
      setcanDrag(false);
    };
    window.addEventListener("mouseup", cancelDrag);
    return () => {
      window.removeEventListener("mouseup", cancelDrag);
    };
  }, [canDrag]);
  // useEffect(() => {
  //   if (viewRef?.current?.open) {
  //     api.update({
  //       x: 0,
  //       y: 0,
  //     });
  //   }
  // }, [api, viewRef]);

  // useEffect(() => {
  //   if (point.y < -400) {
  //     setTimeout(() => {
  //       viewRef?.current?.close();
  //     }, 300);
  //     // setpoint({ x: 0, y: 0 });
  //   }
  // }, [point.y, viewRef]);

  // useGesture(
  //   {
  //     onDrag: ({ offset: [dx, dy] }) => {
  //       // if (zoom.scale === 1) {
  //       //   // setpoint({ x: 0, y: 0 });
  //       //   return;
  //       // }
  //       if (zoom.scale === 1) return;
  //       setpoint({
  //         x: dx,
  //         y: dy,
  //       });
  //       // setpoint({
  //       //   x: zoom.scale === 1 ? 0 : dx,
  //       //   y: zoom.scale === 1 ? 0 : dy,
  //       // });
  //     },
  //     // onWheel: ({}) => {
  //     //   if (zoom.scale === 1) {
  //     //     // setpoint({ x: 0, y: 0 });
  //     //   }
  //     // },
  //   },
  //   {
  //     target: viewRef,
  //   }
  // );
  return (
    <>
      <motion.dialog
        onPointerDown={(e) => {
          // api.start(x,y)
          // api.start({
          //   x: 0,
          //   y: 0,
          // });
          if (zoom.scale === 1) return;
          setcanDrag(true);
          setstart((prev) => ({
            ...prev,
            x: e.clientX - point.x,
            y: e.clientY - point.y,
          }));
          // setstart((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
        }}
        onPointerUp={() => {
          if (zoom.scale > 1) return;
          setTimeout(() => {
            api.start({ x: 0, y: 0 });
          }, 300);
          // if (zoom.scale === 1) return;
          if (canDrag) {
            setcanDrag(false);
          }
          if (zoom.scale === 1) {
            // setpoint((prev) => ({
            //   ...prev,
            //   x: 0,
            //   y: 0,
            // }));
          }
          if (point.y < -400) {
            // setpoint({ x: 0, y: -15000 });
            // setTimeout(() => {
            viewRef?.current?.close();
            // }, 300);
            // setpoint({ x: 0, y: -500 });
          }
        }}
        onPointerEnter={() => {
          sethovered(true);
          setVisible(true);
          if (zoom.scale === 1) {
            setVisible(false);
          }
        }}
        onPointerMove={(e) => {
          if (canDrag) {
            // setpoint((prev) => ({
            //   ...prev,
            //   x: e.clientX - start.x,
            //   y: e.clientY - start.y,
            // }));
            // pointX = e.clientX - start.x;
            // pointY = e.clientY - start.y;
          }
          if (!visible) {
            if (zoom.scale === 1) return;
            setVisible(true);
          }
        }}
        onPointerLeave={() => sethovered(false)}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        animate={{
          opacity: viewRef?.current?.open ? 1 : 0,
        }}
        exit={{ opacity: 0 }}
        onClose={() => {
          setZoom({ scale: 1 });
          // setpoint({ x: 0, y: 0 });
        }}
        onDoubleClick={() => {
          setVisible(true);
          setZoom({ scale: 4 });
          if (zoom.scale === 4) {
            setZoom({ scale: 1 });
          }
        }}
        onWheel={(e) => {
          if (!visible) {
            setVisible(true);
            setpoint({
              x: 0,
              y: 0,
            });
          }
          const scale = zoom.scale + e.deltaY * -0.01;
          setZoom((prev) => ({
            ...prev,
            scale: Math.min(Math.max(1, scale), 4),
          }));
          // api.start({
          //   x: 0,
          //   y: 0,
          // });
          // setZoom((prev) => ({
          //   ...prev,
          //   scale: Math.min(Math.max(1, scale), 4),
          // }));
          // scale :{} 5
          // api.start({
          //   scale: init(scale),
          //   // scale: Number(scale) + e.deltaY * -0.01,
          // });

          // var xs = (e.clientX - point.x) / scale,
          //   ys = (e.clientY - point.y) / scale;
          // point.x = e.clientX - xs * scale;
          // point.y = e.clientY - ys * scale;
        }}
        onClick={(e) => {
          // if (e.target === e.currentTarget) {
          //   e.currentTarget.close();
          // }
        }}
        className={s.dialog}
        ref={viewRef}
      >
        <h1
          style={{
            color: "var(--blue-origin)",
            position: "fixed",
            zIndex: "1000",
          }}
        >
          {zoom.scale}
        </h1>

        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              animate={{
                opacity: visible ? 1 : 0,
              }}
              exit={{ opacity: 0 }}
              className={s.indicator}
            >
              <img draggable={false} src={view.src} alt={view.name}></img>
              <div
                style={{
                  transition: "all .3s ease-in",
                  // transform: `scale(${1 / zoom.scale})`,
                  backgroundColor: "rgba(0 0 0/.35)",
                }}
              ></div>
              <div
                className={s.mask}
                style={{
                  transition: "all .3s ease-in",
                  transform: `scale(${1 / zoom.scale})`,
                  // transform: `translate(${point.x}px,${point.y}px) scale(${
                  //   1 / zoom.scale
                  // })`,
                  // transform: `translate(${.5 / point.x}px,${
                  //   .5 / point.y
                  // }px) scale(${1 / zoom.scale})`,
                  // transform: `scale(${1 - (zoom.scale - 1) * 0.2})`,
                  // transform: `scale(${1 - (zoom.scale - 1) * 0..8})`,

                  // transform: `scale(${1 - (zoom.scale * 0.1) / 3.5})`,
                  // transform: `scale(${1 / zoom.scale})`,
                  border: "2px solid white",
                  // WebkitMaskImage: `url(${view.src})`,
                  // maskImage: `url(${view.src})`,

                  // clipPath: "inset(0)",
                  // maskImage: `linear-gradient(transparent, transparent), url(${view.src})`,
                  // maskSize: "cover",
                  // maskRepeat: "no-repeat",
                }}
              >
                <img
                  draggable={false}
                  className={s.indicator}
                  style={{
                    opacity: "0",
                  }}
                  // style={{ transform: `translate(0px,0px) scale(${zoom.scale})` }}
                  src={view.src}
                  alt={view.name}
                ></img>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
            // draggable={!visible}
            draggable={false}
            style={{
              touchAction: "none",
              position: "fixed",
              inset: "0",
              width: "100%",
              height: "100%",
              // cursor: zoom.scale > 1 ? "move" : "initial",
              left: x,
              top: y,
              // x,
              // y,
              scale: zoom.scale,
              transition: canDrag ? "initial" : "transform 0.3s ease-in-out",
              // cursor: visible
              //   ? zoom.scale < 4
              //     ? "zoom-in"
              //     : "zoom-out"
              //   : "initial",
            }}
            ref={imgRef}
          >
            <Image
              // draggable={!visible}
              draggable={false}
              style={{
                touchAction: "none",
                // position: "fixed",
                // inset: "0",
                // width: "100%",
                // cursor: zoom.scale > 1 ? "move" : "initial",
                // x,
                // y,
                // scale: zoom.scale,
                // transition: canDrag ? "initial" : "transform 0.3s ease-in-out",
                // cursor: visible
                //   ? zoom.scale < 4
                //     ? "zoom-in"
                //     : "zoom-out"
                //   : "initial",
              }}
              fill
              src={view.src}
              alt={view.name}
            ></Image>
          </animated.div>
        </div>
      </motion.dialog>
    </>
  );
}
