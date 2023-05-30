import { AnimatePresence, motion } from "framer-motion";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Props } from "../../types/interfaces";
import BackHeader from "./BackHeader";
import Navitems from "./Navitems";
import { pages } from "./Header";
import useEscape from "../../hooks/useEscape";

function SelectModal() {
  const { selectMode, setselectMode } = useContext(AppContext) as Props;

  useEscape(() => {
    if (!selectMode) return;
    setselectMode?.(false);
  });

  return (
    <BackHeader
      selectMode={selectMode!}
      onClick={() => {
        setselectMode?.(false);
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
