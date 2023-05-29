import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { CSSProperties, MouseEventHandler, ReactNode } from "react";
import s from "../../styles/Home.module.scss";
function BackHeader(props: {
  style?: CSSProperties;
  selectMode?: boolean;
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
    <div
      
      style={props.style}
      className={s.backHeader}
    >
      <button onClick={handleClick}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      {props.children}
    </div>
  );
}

export default BackHeader;
