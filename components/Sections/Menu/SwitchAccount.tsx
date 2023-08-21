import {
  faAngleUp,
  faAngleDown,
  faCheck,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useContext, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import { Props } from "../../../types/interfaces";
import s from "../../Sections/Menu/menu.module.scss";

export default function SwitchAccount(props: {
  setLoading: any;
  signout: Function;
}) {
  const { setLoading, signout } = props;
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
              <p>{a.email}</p>
              <p>
                {a.password} {a.default ? "(Default)" : ""}
              </p>
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
          style={{
            color: "darkgray",
            fontSize: "15px",
            padding: "0 1rem",
            margin: ".5rem 0",
          }}
        >
          <FontAwesomeIcon icon={faInfoCircle} /> Switch account for testing
        </p>
      </footer>
    </div>
  );
}
