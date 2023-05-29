import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { ReactNode, MouseEventHandler, CSSProperties } from "react";
import s from "../../styles/Home.module.scss";
import { Style } from "util";
import style from "styled-jsx/style";
function BackHeader(props: {
  style?: CSSProperties;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) {
  const router = useRouter();
  const handleClick =
    props.onClick ||
    (() => {
      router.back();
    });
  return (
    <div style={props.style} className={s.backHeader}>
      <button onClick={handleClick}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      {props.children}
    </div>
  );
}

export default BackHeader;
