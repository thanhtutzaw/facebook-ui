import { faSignOut, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useActive } from "../../../hooks/useActiveTab";
import { signout } from "../../../lib/signout";
import s from "../../Sections/Menu/menu.module.scss";
interface MenuProps {
  tabIndex: number;
}
export default function Menu(props: MenuProps) {
  const { tabIndex } = props;
  const { navigateTab } = useActive();
  const [loading, setLoading] = useState(false);
  return (
    <div className={s.container}>
      <button
        tabIndex={tabIndex}
        className={s.item}
        onClick={() => navigateTab("profile")}
      >
        <FontAwesomeIcon
          style={{ color: "#0070f3", fontWeight: "bold" }}
          icon={faUser}
        />
        Go to Profile
      </button>

      <button
        tabIndex={tabIndex}
        disabled={loading}
        className={`${s.item}`}
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
