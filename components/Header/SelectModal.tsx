import { AnimatePresence, motion } from "framer-motion";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Props } from "../../types/interfaces";
import BackHeader from "./BackHeader";
import Navitems from "./Navitems";
import { pages } from "./Header";

function SelectModal() {
  const { selectMode, setselectMode } = useContext(AppContext) as Props;
  return (
    
      <BackHeader
        selectMode={selectMode!}
        onClick={() => {
          setselectMode?.(false);
        }}
        style={{
          position: "initial",
          borderBottom: "4px solid rgb(235, 235, 235)",
          // margin: "0 auto",
          // width: selectMode ? "100vw" : "200px",
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
