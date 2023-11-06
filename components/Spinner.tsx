import React, { CSSProperties } from "react";
import "nprogress/nprogress.css";
function Spinner({
  navBar = true,
  fullScreen = false,
  size = 30,
  color,
  style = { marginTop: !fullScreen ? "2rem" : "initial" }, // style,
}: {
  color?: string;
  navBar?: boolean;
  fullScreen?: boolean;
  size?: number;
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
            style={{
              width: `${size}px`,
              height: `${size}px`,
              borderTopColor: `${color ?? "#0070f3"} !important`,
              borderLeftColor: `${color ?? "#0070f3"} !important`,
            }}
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
            style={{
              width: `${size}px`,
              height: `${size}px`,
              borderTopColor: `${color ?? "#0070f3"} !important`,
              borderLeftColor: `${color ?? "#0070f3"} !important`,
            }}
            className="spinner-icon"
          ></div>
        </div>
      </div>
    </div>
  );
}

export default Spinner;
