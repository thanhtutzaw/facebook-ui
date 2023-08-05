import {
  faBookmark,
  faSignOut,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { useActive } from "../../../hooks/useActiveTab";
import { signout } from "../../../lib/signout";
import s from "../../Sections/Menu/menu.module.scss";
import { useRouter } from "next/router";
import { PageContext, PageProps } from "../../../context/PageContext";
interface MenuProps {
  tabIndex: number;
}
export default function Menu(props: MenuProps) {
  const { tabIndex } = props;
  const { navigateTab } = useActive();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return (
    <div className={s.container}>
      <button
        aria-label="Go to Profile"
        title="Go to Profile"
        tabIndex={tabIndex}
        className={s.item}
        onClick={() => navigateTab("profile")}
      >
        <FontAwesomeIcon
          style={{ color: "#0070f3", fontWeight: "bold" }}
          icon={faUser}
        />
        View Profile
      </button>
      <button
        aria-label="Go to SavedPost"
        title="Go to SavedPost"
        tabIndex={tabIndex}
        className={s.item}
        onClick={() => {
          router.push("/saved");
        }}
      >
        <FontAwesomeIcon
          style={{ color: "#0070f3", fontWeight: "bold" }}
          icon={faBookmark}
        />
        Saved Post
      </button>

      <button
        aria-label="Sign out Button"
        title="Sign out"
        tabIndex={tabIndex}
        disabled={loading}
        className={`${s.item} ${s.logoutBtn}`}
        onClick={() => {
          setLoading(true);
          try {
            setTimeout(() => {
              signout();
              // setActive?.("/");
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
        {loading ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
