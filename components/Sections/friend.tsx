import React, { useEffect } from "react";
import styles from "../../styles/Home.module.css";

function Friend() {
  useEffect(() => {
    console.log("Friend is Rendering");
  }, []);

  return (
    <div id="friend" className={styles.add}>
      add
    </div>
  );
}

export default Friend;
