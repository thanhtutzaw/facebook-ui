/* eslint-disable @next/next/no-img-element */
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import s from "./Post.module.scss";
export function ViewModal(props: { view: { src: string; name: string } }) {
  const { view } = props;
  const { viewRef } = useContext(PageContext) as PageProps;

  const [zoom, setZoom] = useState({ scale: 1 });
  const imgRef = useRef<HTMLImageElement>(null);
  const [start, setstart] = useState({ x: 0, y: 0 });
  // let pointX = 0,
  //   pointY = 0;
  const [point, setpoint] = useState({ x: 0, y: 0 });
  // useEffect(() => {
  //   const img = imgRef?.current!;
  //   // img.style.transform = `translate(${start.x}px,${start.y}px) scale(${zoom.scale})`;
  // }, [start.x, start.y, zoom]);
  const [visible, setVisible] = useState(false);
  const [hovered, sethovered] = useState(false);
  useEffect(() => {
    let timeoutId: string | number | NodeJS.Timeout | undefined;

    if (visible) {
      if (zoom.scale === 1) {
        setpoint({
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
  }, [hovered, visible, zoom.scale]);
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
  return (
    <>
      <motion.dialog
        onPointerDown={(e) => {
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
          // if (zoom.scale === 1) return;
          if (canDrag) {
            setcanDrag(false);
          }
          if (zoom.scale === 1) {
            setpoint((prev) => ({
              ...prev,
              x: 0,
              y: 0,
            }));
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
            setpoint((prev) => ({
              ...prev,
              x: e.clientX - start.x,
              y: e.clientY - start.y,
            }));
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
          var xs = (e.clientX - point.x) / scale,
            ys = (e.clientY - point.y) / scale;
          point.x = e.clientX - xs * scale;
          point.y = e.clientY - ys * scale;
        }}
        onClick={(e) => {
          // if (e.target === e.currentTarget) {
          //   e.currentTarget.close();
          // }
        }}
        className={s.dialog}
        ref={viewRef}
      >
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
                  transform: `translate(${point.x}px,${point.y}px) scale(${
                    1 / zoom.scale
                  })`,
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
          <img
            draggable={!visible}
            style={{
              position: "fixed",
              inset: "0",
              width: "100%",
              cursor: zoom.scale > 1 ? "move" : "initial",
              transform: `translate(${point.x}px,${point.y}px) scale(${zoom.scale})`,
              transition: canDrag ? "initial" : "all 0.3s ease-in-out",
              // cursor: visible
              //   ? zoom.scale < 4
              //     ? "zoom-in"
              //     : "zoom-out"
              //   : "initial",
            }}
            ref={imgRef}
            src={view.src}
            alt={view.name}
          ></img>
        </div>
      </motion.dialog>
    </>
  );
}
