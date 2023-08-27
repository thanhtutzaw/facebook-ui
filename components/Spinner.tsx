import React, { CSSProperties } from "react";
import "nprogress/nprogress.css";
function Spinner({
  navBar = true,
  fullScreen = false,
  size = 30,
  style = { marginTop: !fullScreen ? "2rem" : "initial" },
}: {
  navBar?: boolean;
  fullScreen?: boolean;
  size?: any;
  style?: CSSProperties;
}) {
  if (!fullScreen) {
    return (
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
  return (
    <div
      style={{
        display: fullScreen ? "grid" : "block",
        alignContent: "center",
        justifyItems: "center",
        textAlign: "center",
        height: fullScreen
          ? navBar
            ? "calc(100dvh - 160px)"
            : "100vh"
          : "initial",
      }}
    >
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
    </div>
  );
}

export default Spinner;
