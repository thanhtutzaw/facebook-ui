import React from "react";
import "nprogress/nprogress.css";
function Spinner({ size = 30 }: { size?: any }) {
  return (
    <div style={{ marginTop: "2rem" }} id="nprogress">
      <div style={{ display: "flex", justifyContent: "center" }} role="spinner">
        <div
          style={{ width: `${size}px`, height: `${size}px` }}
          className="spinner-icon"
        ></div>
      </div>
    </div>
  );
}

export default Spinner;
