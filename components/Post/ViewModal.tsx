/* eslint-disable @next/next/no-img-element */
import { RefObject, useEffect, useRef, useState } from "react";
import s from "./Post.module.scss";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
export function ViewModal(props: {
  viewRef: RefObject<HTMLDialogElement>;
  view: { src: string; name: string };
}) {
  const { viewRef, view } = props;
  const [zoom, setZoom] = useState({ scale: 1 });
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = imgRef?.current!;
    img.style.transform = `translate(0px,0px) scale(${zoom.scale})`;
  }, [zoom]);
  const [visible, setVisible] = useState(false);
  const [hovered, sethovered] = useState(false);
  useEffect(() => {
    let timeoutId: string | number | NodeJS.Timeout | undefined;

    if (visible) {
      if (zoom.scale === 1) {
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

  return (
    <>
      <motion.dialog
        onPointerEnter={() => {
          sethovered(true);
          setVisible(true);
          if (zoom.scale === 1) {
            setVisible(false);
          }
        }}
        onPointerMove={() => {
          if (!visible) {
            if (zoom.scale === 1) return;
            setVisible(true);
          }
        }}
        // onPointerLeave={() => sethovered(false)}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        animate={{
          opacity: viewRef.current?.open ? 1 : 0,
        }}
        exit={{ opacity: 0 }}
        onClose={() => {
          setZoom({ scale: 1 });
        }}
        onWheel={(e) => {
          if (!visible) {
            setVisible(true);
          }
          const scale = zoom.scale + e.deltaY * -0.01;
          setZoom((prev) => ({
            ...prev,
            scale: Math.min(Math.max(1, scale), 4),
          }));
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            e.currentTarget.close();
          }
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
              <img
                draggable={false}
                // style={{ transform: `translate(0px,0px) scale(${zoom.scale})` }}
                src={view.src}
                alt={view.name}
              ></img>
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
                  // border: "2px solid var(--blue-origin)",
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
            style={{ position: "fixed", inset: "0", width: "100%" }}
            ref={imgRef}
            src={view.src}
            alt={view.name}
          ></img>
        </div>
      </motion.dialog>
    </>
  );
}
