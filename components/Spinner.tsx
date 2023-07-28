import React from "react";
import "nprogress/nprogress.css";
function Spinner({ size = 30 }: { size?: any }) {
  return (
    // <p>Loading...</p>
    <div className="loading" style={{ marginTop: "2rem" }}>
      <div
        className="spinner"
        style={{ display: "flex", justifyContent: "center" }}
        role="spinner"
      >
        <div
          style={{ width: `${size}px`, height: `${size}px` }}
          className="spinner-icon"
        ></div>
      </div>
    </div>
  );
}

export default Spinner;
