import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { ReactNode, MouseEventHandler } from "react";
import s from "../../styles/Home.module.scss";
function BackHeader(props: {
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
    <div className={s.backHeader}>
      <button onClick={handleClick}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      {props.children}
    </div>
  );
}

export default BackHeader;
