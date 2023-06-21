import { RefObject, useEffect, useRef, useState } from "react";
import s from "./Post.module.scss";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
export function ViewModal(props: {
  setview: Function;
  viewRef: RefObject<HTMLDialogElement>;
  view: { src: string; name: string };
}) {
  const { setview, viewRef, view } = props;
  // let scale = 1;
  const [zoom, setZoom] = useState({ scale: 1 });
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = imgRef?.current!;
    img.style.transform = `translate(0px,0px) scale(${zoom.scale})`;
  }, [zoom]);
  // useEffect(() => {

  // }, [third])
  const [visible, setVisible] = useState(false);
  const [hovered, sethovered] = useState(false);
  useEffect(() => {
    let timeoutId: string | number | NodeJS.Timeout | undefined;

    if (visible) {
      if (zoom.scale === 1) {
        setVisible(false);
      }
      if (hovered) {
        setVisible(true);
        if (zoom.scale === 1) {
          setVisible(false);
        }
        clearTimeout(timeoutId); // Cancel the timeout if the element is being hovered
        return;
      }

      timeoutId = setTimeout(() => {
        setVisible(false);
      }, 500);
    }

    return () => {
      clearTimeout(timeoutId); // Cleanup the timeout on component unmount or when visible changes
    };
  }, [hovered, visible, zoom.scale]);

  return (
    <>
      <motion.dialog
        onMouseEnter={() => {
          sethovered(true);
          setVisible(true);
          if (zoom.scale === 1) {
            setVisible(false);
          }
        }}
        onMouseLeave={() => sethovered(false)}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
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
          // scale += e.deltaY * -0.01;
          const scale = zoom.scale + e.deltaY * -0.01;
          // setZoom({...zoom,scale: Math.min(Math.max(1, scale), 4)})
          setZoom((prev) => ({
            ...prev,
            scale: Math.min(Math.max(1, scale), 4),
          }));
          // if (zoom.scale === 1) {
          //   setVisible(false);
          // }
          // Restrict scale
          // scale = Math.min(Math.max(0.125, scale), 4);
          const img = imgRef?.current!;
          // img.style.scale = scale.toString();
          // img.style.transform = `translate(0px,0px) scale(${zoom.scale})`;
          // img.style.transform = `translate(0px,0px) , scale(${scale.toString()})`;
        }}
        // onclick="event.target==this && this.close()"
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
                // style={{ position: "absolute", top: "0" }}
                // style={{ transform: `translate(0px,0px) scale(${zoom.scale})` }}
                src={view.src}
                alt={view.name}
              ></img>
              <div
                style={{
                  transition: "all .3s ease-in",
                  transform: `scale(${(1 / zoom.scale) * 1})`,
                  border: "3px solid white",
                }}
              >
                <img
                  className={s.indicator}
                  style={{
                    opacity: "0",
                  }}
                  // style={{ position: "absolute", top: "0" }}
                  // style={{ transform: `translate(0px,0px) scale(${zoom.scale})` }}
                  // ref={imgRef}
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
                  // onClick={(e) => {
                  //   e.preventDefault();
                  //   e.stopPropagation();
                  //   viewRef.current?.close();
                  // }}
                  aria-label="Close Photo View modal"
                  tabIndex={-1}
                  className={s.closeDialog}
                >
                  <FontAwesomeIcon icon={faClose} />
                </motion.button>
              </form>
            )}
          </AnimatePresence>

          {/*eslint-disable-next-line @next/next/no-img-element */}
          <img
            style={{ position: "fixed", inset: "0", width: "100%" }}
            // style={{ transform: `translate(0px,0px) scale(${zoom.scale})` }}
            ref={imgRef}
            src={view.src}
            alt={view.name}
          ></img>
        </div>
      </motion.dialog>
    </>
  );
}
