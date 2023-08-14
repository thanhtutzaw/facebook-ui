import React, { CSSProperties } from "react";
import "nprogress/nprogress.css";
function Spinner({
  size = 30,
  style = { marginTop: "2rem" },
}: {
  size?: any;
  style?: CSSProperties;
}) {
  return (
    // <p>Loading...</p>
    <div className="loading" style={style}>
      <div
        className="spinner"
        style={{ display: "flex", justifyContent: "center" }}
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
