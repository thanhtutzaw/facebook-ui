import { RefObject, useRef } from "react";
import s from "./Post.module.scss";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export function ViewModal(props: {
  viewRef: RefObject<HTMLDialogElement>;
  view: { src: string; name: string };
}) {
  const { viewRef, view } = props;
  let scale = 1;
  const imgRef = useRef<HTMLImageElement>(null);
  return (
    <>
      <dialog
        // style={{ scale: scale }}
        onWheel={(e) => {
          // e.preventDefault();

          scale += e.deltaY * -0.01;

          // Restrict scale
          scale = Math.min(Math.max(1, scale), 4);
          // scale = Math.min(Math.max(0.125, scale), 4);
          console.log(scale);
          const img = imgRef?.current!;
          img.style.scale = scale.toString();
          // Apply scale transform
          // const img = document.getElementsByTagName("img")[0];
          // console.log(img);
          // img.style.transform = `scale(${scale})`;
          // console.log(e.currentTarget);
        }}
        // onclick="event.target==this && this.close()"
        onClick={(e) => {
          // console.log(e.target);
          if (e.target === e.currentTarget) {
            e.currentTarget.close();
          }
        }}
        className={s.dialog}
        ref={viewRef}
      >
        <button
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
        <img ref={imgRef} src={view.src} alt={view.name}></img>
      </dialog>
    </>
  );
}
