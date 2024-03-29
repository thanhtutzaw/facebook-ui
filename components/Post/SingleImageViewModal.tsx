import { usePageContext } from "@/context/PageContext";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { animated, useSpring } from "@react-spring/web";
import { UserGestureConfig, useGesture } from "@use-gesture/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { setTimeout } from "timers";
import Spinner from "../Spinner";
import s from "./index.module.scss";
export function SingleImageViewModal() {
  const { singleImageModalRef: modalRef } = usePageContext();
  const [loading, setLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const [drag, setdrag] = useState(false);
  const [{ x, y, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
  }));
  const [visible, setVisible] = useState(scale.get() > 1);
  // const imageBound = imgRef.current?.getBoundingClientRect()!;
  // const container = imgRef.current?.parentElement?.getBoundingClientRect()!;
  // const newWidth = (imageBound?.width - imgRef.current?.clientWidth!) / 2;
  const router = useRouter();
  // useEffect(() => {
  //   if (!router.query.viewImage) return;
  //   const { viewImage, imageName } = router.query;
  //   setsingleImageModal({ src: String(viewImage), name: String(imageName) });
  // }, [router]);
  // useLayoutEffect(() => {
  //   router.beforePopState(() => {
  //     console.log(history.length);
  //     // setsingleImageModal(null);
  //     return true;
  //   });
  //   return () => {
  //     router.beforePopState(() => true);
  //   };
  // }, [router, setsingleImageModal]);

  const gestureConfig: UserGestureConfig = {
    wheel: {
      from: () => [x.get(), y.get()],
      // bounds: {100},
      // from: () => [0, 0],
    },
    drag: {
      axis: scale.get() <= 1.3 ? "y" : undefined,
      from: () => [
        scale.get() === 1 ? 0 : x.get(),
        scale.get() === 1 ? 0 : y.get(),
      ],
      // rubberband: true,
    },
    pinch: {
      target: imgRef,
      from: () => [0, 0],
    },
  };
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
        const imageBound = imgRef.current?.getBoundingClientRect()!;
        const container =
          imgRef.current?.parentElement?.getBoundingClientRect()!;
        const newWidth = (imageBound.width - imgRef.current?.clientWidth!) / 2;
        const newHeight =
          (imageBound.height - imgRef.current?.clientHeight!) / 2;
        if (scale.get() > 1) {
          if (imageBound?.left > container.left) {
            api.start({
              x: newWidth,
            });
          } else if (imageBound.right < container.right) {
            api.start({
              x: -(imageBound.width - imgRef.current?.clientWidth!) + newWidth,
            });
          }
          if (imageBound?.top > container.top) {
            api.start({ y: newHeight });
            // api.start({ y: imageBound.height - imgRef.current?.clientHeight! });
          } else if (imageBound.bottom < container.bottom) {
            api.start({
              y:
                -(imageBound.height - imgRef.current?.clientHeight!) +
                newHeight,
            });
            // api.start({ x: -(imageBound.width - container.width) });
          }
          return;
        } else {
          api.start({ x: 0, y: 0, scale: 1 });
        }
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
        });

        setTimeout(() => {
          if (!snap || scale.get() > 1) return;
          modalRef?.current?.close();
        }, 300);
      },
      onPinch: ({ movement: m, origin: [ox, oy], offset: [s, r], cancel }) => {
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
      onWheel: ({
        // xy: [x, y],
        memo,
        delta: [, dy],
        offset: [d1, d2],
        movement: [_, m2],
        event,
      }) => {
        // if(scale > 1)
        // if(scale.get() < 1) return;
        // if (m2 > 0) return;
        console.log({ dy, m2 });
        if (scale.get() < 2) {
          api.start({ x: 0, y: 0, scale: 1 });
        }
        // if (scale.get() < 1) {
        //   api.set({ x: 0, y: 0, scale: 1 });
        // }
        // const ref = imgRef?.current!.getBoundingClientRect()!;
        const target = imgRef?.current;
        const ref = target?.getBoundingClientRect()!;
        console.log({ ref });
        // memo ??= { x: x.get(), y: y.get(), tx, ty, scale: scale.get() };
        // const displacementX = tx / memo.scale;
        // const displacementY = ty / memo.scale;
        // api.start({
        //   scale: Math.min(Math.max(scale.get() + dy * -0.01, 1), 4),
        //   // x: memo.x + displacementX * memo.scale - 1 / 50,
        //   // y: memo.y + displacementY * memo.scale - 1 / 50,
        // });
        // return memo;

        // const newScale = scale.get() >= 4 ? 1 : 4;
        // const offsetX =
        //   ((ref.x - ref.width / 2) * (1 - scale.get())) / scale.get();
        // const offsetY =
        //   ((ref.y - ref.height / 2) * (1 - scale.get())) / scale.get();
        // api.start({
        //   scale: Math.min(Math.max(scale.get() + dy * -0.01, 1), 4),
        //   x: offsetX,
        //   y: offsetY,
        //   // immediate: down,
        // });

        // var xs = (event.clientX - x.get()) / scale.get(),
        //   ys = (event.clientY - y.get()) / scale.get();
        // const newX = (ref.x + ref.width) / 2,
        // newY = (ref.y + ref.height) / 2;
        // api.start({
        //   scale: Math.min(Math.max(scale.get() + dy * -0.01, 1), 4),
        //   x:
        //     newX -
        //     x.get() * scale.get() +
        //     (dy * -0.01) / scale.get() +
        //     dy * -0.01,
        //   y:
        //     newY -
        //     y.get() * scale.get() +
        //     (dy * -0.01) / scale.get() +
        //     dy * -0.01,
        // });

        // const tx = ox - (x + width / 2)
        // const ty = oy - (y + height / 2)

        const tx = event.clientX - (ref.x + ref.width / 2);
        const ty = event.clientY - (ref.y + ref.height / 2);

        memo = [x.get(), y.get(), tx, ty];
        // console.log(memo[0], x.get());
        const newX = memo[0] - (m2 - 1) * memo[2];
        const newY = memo[1] - (m2 - 1) * memo[3];
        api.start({
          scale: Math.min(Math.max(scale.get() + dy * -0.01, 1), 4),
          x: ref.x + ref.width / 2 - (x.get() * scale.get()) / 1 - scale.get(),
          y: ref.y + ref.height / 2 - (y.get() * scale.get()) / 1 - scale.get(),
        });
        return memo;
      },

      onWheelStart: (state) => {},
      onWheelEnd: ({ wheeling }) => {
        if (scale.get() <= 1.5) {
          api.start({ x: 0, y: 0, scale: 1 });
          setVisible(false);
        } else {
          setVisible(true);
        }
      },
    },
    gestureConfig
  );
  useEffect(() => {
    setdrag(false);
  }, [scale, x, y]);
  const singleImageModal = useMemo(() => {
    if (!router.query.viewImage) {
      return null;
    }
    return {
      src: String(router.query.viewImage),
      name: String(router.query.imageName),
    };
  }, [router]);
  useLayoutEffect(() => {
    if (singleImageModal) {
      modalRef?.current?.showModal();
    } else {
      modalRef?.current?.close();
    }
  }, [modalRef, singleImageModal]);
  const imageURL = singleImageModal && singleImageModal.src;
  const imageName = singleImageModal && singleImageModal.name;
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
        opacity: imageURL ? 1 : 0,
      }}
      style={{ opacity: 0, transition: "all .2s ease-in-out" }}
      exit={{ opacity: 0 }}
      onClose={(e) => {
        e.currentTarget.style.opacity = "0";
        api.set({ x: 0, y: 0, scale: 1 });
        setVisible(false);
        console.log({ singleImageModal });
        if (!singleImageModal) return;
        router.back();
        console.log("back in modal");
        setLoading(true);
      }}
      className={s.imageDialog}
      ref={modalRef}
    >
      <AnimatePresence>
        {imageURL && (
          <>
            {/* {visible && (
              <Indicator />
            )} */}
            <div className={s.viewContainer}>
              {!visible && <CloseBtn visible={visible} />}
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
                <AnimatePresence>
                  {loading && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: loading ? 1 : 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <Spinner
                        navBar={false}
                        fullScreen
                        style={{ zIndex: "1000000" }}
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
                <Image
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  onLoad={() => {
                    setLoading(false);
                  }}
                  className="!w-[auto] !h-[auto] !m-auto "
                  loading="eager"
                  style={{ touchAction: "none" }}
                  priority={false}
                  draggable={false}
                  fill
                  src={imageURL}
                  alt={imageName ?? "Image not found!"}
                />
              </animated.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.dialog>
  );
}

function Indicator({}) {
  return (
    <motion.div // className={s.indicator}
    >
      {/* <img draggable={false} src={imageURL} alt={imageName}></img>
    <div
     style={{
       transition: "all .3s ease-in",
       backgroundColor: "rgba(0 0 0/.35)",
     }}
    ></div> */}
      {/* <animated.div
     className={s.mask}
     style={{
       scale: 1 / scale.get(),
       x: 2 / x.get(),
       y: 2 / x.get(),
       border: "2px solid white",
     }}
    >
     <img
       draggable={false}
       className={s.indicator}
       style={{
         opacity: "0",
       }}
       src={imageURL}
       alt={imageName}
     ></img>
    </animated.div> */}
    </motion.div>
  );
}

function CloseBtn({ visible }: { visible: boolean }) {
  return (
    <form method="dialog">
      <motion.button
        initial={{
          opacity: 0,
        }}
        transition={{
          duration: 0.3,
        }}
        animate={{
          opacity: !visible ? 1 : 0,
        }}
        exit={{
          opacity: 0,
        }}
        title="Close"
        aria-label="Close Photo View modal"
        tabIndex={-1}
        className={s.closeDialog}
      >
        <FontAwesomeIcon icon={faClose} />
      </motion.button>
    </form>
  );
}
