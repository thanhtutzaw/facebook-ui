import React, { useEffect } from "react";
import styles from "../../styles/Home.module.css";

function Friend() {
  useEffect(() => {
    console.log("Friend is Rendering");
  }, []);
  // if (active !== "Friend") return;
  // return <>{active === "friend" && <div>add</div>}</>;
  return <>add</>;
}

export default Friend;
