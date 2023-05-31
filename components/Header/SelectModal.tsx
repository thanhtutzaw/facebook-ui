import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { Props } from "../../types/interfaces";
import BackHeader from "./BackHeader";
import Navitems from "./Navitems";
import { pages } from "./Header";
import useEscape from "../../hooks/useEscape";
import { useRouter } from "next/router";

function SelectModal() {
  const { selectMode, setselectMode } = useContext(AppContext) as Props;

  useEscape(() => {
    if (!selectMode) return;
    setselectMode?.(false);
  });
  const router = useRouter();
  return (
    <BackHeader
      selectMode={selectMode!}
      onClick={() => {
        router.back();
        setselectMode?.(false);
        // window.location.hash = ""
      }}
      style={{
        position: "initial",
        borderBottom: "4px solid rgb(235, 235, 235)",
      }}
    >
      <h2>
        <span>0</span> Selected
      </h2>
      <button className="deleteBtn">Delete</button>
    </BackHeader>
  );
}

export default SelectModal;
