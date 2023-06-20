import { RefObject } from "react";
import s from "./Post.module.scss";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export function ViewModal(props: {
  viewRef: RefObject<HTMLDialogElement>;
  view: { src: string; name: string };
}) {
  const { viewRef, view } = props;
  return (
    <>
      <dialog
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
        <img src={view.src} alt={view.name}></img>
      </dialog>
    </>
  );
}
