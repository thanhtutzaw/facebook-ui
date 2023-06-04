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
  const { selectedId, setSelectedId, selectMode, setselectMode } = useContext(
    AppContext
  ) as Props;
  const router = useRouter();

  useEscape(() => {
    if (!selectMode) return;
    setselectMode?.(false);
    setSelectedId?.([]);
  });
  return (
    <BackHeader
      selectMode={selectMode!}
      onClick={() => {
        // router.back();
        setselectMode?.(false);
        setSelectedId?.([]);
        // window.location.hash = ""
      }}
      style={{
        position: "initial",
        borderBottom: "4px solid rgb(235, 235, 235)",
      }}
    >
      <h2>
        <span>{selectedId?.length}</span> Selected
      </h2>
      <button
        onClick={() => {
          alert(selectedId);
        }}
        className="deleteBtn"
      >
        Delete
      </button>
    </BackHeader>
  );
}

export default SelectModal;
