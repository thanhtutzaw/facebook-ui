import { RefObject, useEffect, useRef, useState } from "react";
import s from "./Post.module.scss";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

  return (
    <>
      <dialog
        onClose={() => {
          setZoom({ scale: 1 });
        }}
        onWheel={(e) => {
          // scale += e.deltaY * -0.01;
          const scale = zoom.scale + e.deltaY * -0.01;
          // setZoom({...zoom,scale: Math.min(Math.max(1, scale), 4)})
          setZoom((prev) => ({
            ...prev,
            scale: Math.min(Math.max(1, scale), 4),
          }));
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
        <button
          title="Close"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            viewRef.current?.close();
          }}
          aria-label="Close Photo View modal"
          tabIndex={-1}
          className={s.closeDialog}
        >
          <FontAwesomeIcon icon={faClose} />
        </button>
        {/*eslint-disable-next-line @next/next/no-img-element */}
        <img
          // style={{ transform: `translate(0px,0px) scale(${zoom.scale})` }}
          ref={imgRef}
          src={view.src}
          alt={view.name}
        ></img>
      </dialog>
    </>
  );
}
