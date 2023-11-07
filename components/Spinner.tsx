import React, { CSSProperties, useEffect, useState } from "react";
import "nprogress/nprogress.css";
function Spinner({
  navBar = true,
  fullScreen = false,
  size = 30,
  color,
  style = { marginTop: !fullScreen ? "2rem" : "initial" },
}: {
  color?: string;
  navBar?: boolean;
  fullScreen?: boolean;
  size?: number;
  style?: CSSProperties;
}) {
  // const [spinnerColor, setcolor] = useState(color ?? "#0070f3");
  if (!fullScreen) {
    return (
      <div className="loading" style={style}>
        <div
          className="spinner"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Spin size={size} color={color} />
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
          <Spin size={size} color={color} />
        </div>
      </div>
    </div>
  );
}

export default Spinner;

function Spin(props: { size: number; color?: string }) {
  const { size, color } = props;
  if(color){
    return <WhiteSpin size={size} />;
  }
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderTopColor: `${color ?? "#0070f3"} !important`,
        borderLeftColor: `${color ?? "#0070f3"} !important`,
      }}
      className="spinner-icon"
    />
  );
}
function WhiteSpin(size:{size:number}) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderTopColor: "white !important",
        borderLeftColor: "white !important",
      }}
      className="spinner-icon white"
    />
  );
}
