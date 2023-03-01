import React, { useState } from "react";
// import styles from "../../styles/Home.module.scss";
import s from "../../Sections/Menu/menu.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOut, faUser } from "@fortawesome/free-solid-svg-icons";
import { signout } from "../../../lib/signout";
import { useActive } from "../../../hooks/useActive";
function Menu() {
  const { navigateTab } = useActive();
  const [loading, setLoading] = useState(false);
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

      <button
        disabled={loading}
        className={`${s.item} ${s.logoutBtn}`}
        onClick={() => {
          setLoading(true);
          try {
            setTimeout(() => {
              signout();
            }, 700);
          } catch (error) {
            setLoading(false);
            console.error(error);
          }
        }}
      >
        <FontAwesomeIcon
          style={{ color: "#0070f3", fontWeight: "bold" }}
          icon={faSignOut}
        />
        {loading ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}

export default Menu;
