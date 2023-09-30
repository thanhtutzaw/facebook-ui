import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { CSSProperties, MouseEventHandler, ReactNode } from "react";
import s from "../../styles/Home.module.scss";
function BackHeader(props: {
  style?: CSSProperties;
  color?: CSSProperties["color"];
  selectMode?: boolean;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) {
  const router = useRouter();
  const handleClick = (e: any) => {
    console.log(window.history);
    // console.log(window.history.length <= 1);
    if (window.history.length > 1) {
      console.log("back route");
      if (props.onClick) {
        props.onClick(e);
      } else {
        router.back();
      }
    } else {
      console.log("Redirect to /");
      router.push("/");
    }
  };
  return (
    <div style={props.style} className={s.backHeader}>
      <button
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
