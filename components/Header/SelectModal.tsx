import React from "react";
import BackHeader from "./BackHeader";

function SelectModal() {
  return (
    <BackHeader
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
