import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { CSSProperties, MouseEventHandler, ReactNode } from "react";
import s from "../../styles/Home.module.scss";
function BackHeader(props: {
  style?: CSSProperties;
  color?: CSSProperties["color"];
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) {
  const router = useRouter();
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (window.history.length > 1) {
      if (props.onClick) {
        props.onClick(e);
      } else {
        router.back();
      }
    } else {
      router.push("/");
    }
  };
  return (
    <div style={props.style} className={`bold-title ${s.backHeader}`}>
      <button
        className="flex justify-center items-center"
        style={{ color: props.color }}
        title="Back"
        aria-label="Back Button"
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      {props.children}
    </div>
  );
}

export default BackHeader;
