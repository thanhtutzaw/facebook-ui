import React, { useEffect } from "react";
import s from "./Friends.module.scss";

export default function Friend() {
  useEffect(() => {
    console.log("Friend is Rendering");
  }, []);
  // if (active !== "Friend") return;
  // return <>{active === "friend" && <div>add</div>}</>;
  return <div className={s.container}>friends</div>;
}
