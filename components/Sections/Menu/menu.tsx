import React from "react";
// import styles from "../../styles/Home.module.scss";
import s from "../../Sections/Menu/menu.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOut, faUser } from "@fortawesome/free-solid-svg-icons";
import { signout } from "../../../lib/signout";
import { useActive } from "../../../hooks/useActive";
function Menu() {
  const { navigateTab } = useActive();

  return (
    <div className={s.container}>
      <button
        className={s.item}
        onClick={() => {
          navigateTab("profile");
        }}
      >
        <FontAwesomeIcon
          style={{ color: "#0070f3", fontWeight: "bold" }}
          icon={faUser}
        />
        Go to Profile
      </button>
      
      <button className={`${s.item} ${s.logoutBtn}`} onClick={() => signout()}>
        {/* <button className={styles.logoutBtn} onClick={() => signout()}> */}
        <FontAwesomeIcon
          style={{ color: "#0070f3", fontWeight: "bold" }}
          icon={faSignOut}
        />
        Logout
      </button>
    </div>
  );
}

export default Menu;
