import {
  faAngleDown,
  faAngleRight,
  faAngleUp,
  faBookmark,
  faCheck,
  faInfoCircle,
  faSignOut,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useActive } from "../../../hooks/useActiveTab";
import { signout } from "../../../lib/signout";
import s from "../../Sections/Menu/menu.module.scss";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { AppContext } from "../../../context/AppContext";
import { Props } from "../../../types/interfaces";
interface MenuProps {
  tabIndex: number;
}
export default function Menu(props: MenuProps) {
  const { tabIndex } = props;
  const { navigateTab } = useActive();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth();
  const { email } = useContext(AppContext) as Props;
  const accounts = [
    {
      uid: "testuser@gmail.com",
      email: "testuser@gmail.com",
      password: "111111",
      default: true,
    },
    {
      uid: "user5@gmail.com",
      email: "user5@gmail.com",
      password: "111111",
    },
    {
      uid: "hellokitty2@gmail.com",
      email: "hellokitty2@gmail.com",
      password: "1111112",
    },
  ];
  const [toggleSwitchAcc, setToggleSwitchAcc] = useState(false);
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
      <div
        style={{
          height: !toggleSwitchAcc ? "65px" : "300px",
          transition: "height 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55) 0s",
        }}
        onClick={() => {
          setToggleSwitchAcc((prev) => !prev);
        }}
        aria-label="Switch Accounts"
        className={s.switchAccountContainer}
      >
        <header>
          <h2>Switch Account</h2>

          {toggleSwitchAcc ? (
            <button
              onClick={() => {
                // setSort((prev: any) => !prev);
              }}
              aria-label="toggle"
            >
              <div>
                <FontAwesomeIcon color="#0070f3" icon={faAngleUp} />
              </div>
            </button>
          ) : (
            <button
              onClick={() => {
                // setSort((prev: any) => !prev);
              }}
              aria-label="toggle"
            >
              <div>
                <FontAwesomeIcon color="#0070f3" icon={faAngleDown} />
              </div>
            </button>
          )}
        </header>
        <ul className={s.content}>
          {accounts.map((a, i) => (
            <li
              onClick={async (e) => {
                e.stopPropagation();
                if (email === a.email) return;
                setLoading(true);
                try {
                  await signout();
                  await signInWithEmailAndPassword(auth, a.email, a.password);
                } catch (error: any) {
                  setLoading(false);
                  console.error(error);
                  alert(error.message);
                }
              }}
              key={i}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="logo.svg" alt={a.email} />
              <div className={s.info}>
                {/* <p>{a.uid}</p> */}
                <p>
                  {a.email} {a.default ? "(Default)" : ""}
                </p>
                <p>{a.password}</p>
              </div>
              {email === a.email && (
                <button title="Current Account">
                  <div>
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                </button>
              )}
            </li>
          ))}

        </ul>
          <footer>
            <p
              style={{ color: "darkgray", fontSize: "15px", padding: "0 1rem" , margin:'.5rem 0' }}
            >
              <FontAwesomeIcon icon={faInfoCircle} /> Switch account for testing
            </p>
          </footer>
      </div>
    </div>
  );
}
