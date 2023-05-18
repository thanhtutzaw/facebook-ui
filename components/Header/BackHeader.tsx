import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import s from "../../styles/Home.module.scss";
function BackHeader(props: { children: ReactNode }) {
  const router = useRouter();
  return (
    <div className={s.backHeader}>
      <button
        onClick={() => {
          router.back();
        }}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      {props.children}
    </div>
  );
}

export default BackHeader;
