import React, { useContext } from "react";
import BackHeader from "./BackHeader";
import { AppContext } from "../../context/AppContext";
import { Props } from "../../types/interfaces";

function SelectModal() {
  const { setselectMode } = useContext(AppContext) as Props;
  return (
    <BackHeader
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
