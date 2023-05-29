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
    <AnimatePresence mode="wait">
      {selectMode ? (
        <motion.div
          key="selectModal"
          initial={{ width: "90%", opacity: 0 }}
          // initial={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          animate={{
            width: !selectMode ? "90%" : "100%",
            opacity: selectMode ? 1 : 0,
          }}
          exit={{ opacity: 0, width: "90%" }}
          className="selectModal"
          style={{ willChange: "width , opacity " }}
          // style={{ width: "400px" }}
        >
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
        </motion.div>
      ) : (
        <>
          <motion.div
            // key="navItems"
            initial={{ width: "100%", opacity: 1 }}
            animate={{
              width: selectMode ? "60%" : "100%",
              opacity: selectMode ? 0 : 1,
            }}
            transition={{ duration: 0.3 }}
            exit={{ opacity: 0, width: "60%" }}
            style={{
              willChange: "width , opacity ",
              opacity: selectMode ? "0" : "1",
              display: "flex",
              width: "100%",
              height: "100%",
            }}
          >
            {pages.map((page, index) => (
              <Navitems
                key={page.name}
                index={index}
                name={page.name}
                icon={page.icon}
              />
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SelectModal;
