import Spinner from "@/components/Spinner";
import { AppContext } from "@/context/AppContext";
import { app } from "@/lib/firebase";
import { signout } from "@/lib/signout";
import { AppProps } from "@/types/interfaces";
import {
  faAngleDown,
  faAngleUp,
  faCheck,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getMessaging } from "firebase/messaging";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import s from "../../Sections/Menu/menu.module.scss";
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
  {
    uid: "wong@gmail.com",
    email: "wong@gmail.com",
    password: "111111",
  },
];
export default function SwitchAccount(props: {
  setLoading: Function;
  loading: boolean;
}) {
  const { setLoading, loading } = props;
  const auth = getAuth();
  const { token } = useContext(AppContext) as AppProps;
  const { email: currentEmail } = { ...token };

  const [toggleSwitchAcc, setToggleSwitchAcc] = useState(false);
  const [checked, setchecked] = useState(currentEmail);

  return (
    <div
      style={{
        height: !toggleSwitchAcc ? "65px" : "300px",
        // transition: "",
      }}
      onClick={() => {
        setToggleSwitchAcc((prev) => !prev);
      }}
      aria-label="Switch Accounts"
      className={s.switchAccountContainer}
    >
      <header>
        <h2 className="font-semibold">Switch Account</h2>

        {toggleSwitchAcc ? (
          <button aria-label="toggle">
            <div>
              <FontAwesomeIcon color="#0070f3" icon={faAngleUp} />
            </div>
          </button>
        ) : (
          <button aria-label="toggle">
            <div>
              <FontAwesomeIcon color="#0070f3" icon={faAngleDown} />
            </div>
          </button>
        )}
      </header>
      <ul className={s.content}>
        {accounts.map((a, index) => (
          <AccountItem
            key={index}
            setLoading={setLoading}
            currentEmail={currentEmail}
            a={a}
            checked={checked}
            setchecked={setchecked}
            loading={loading}
            auth={auth}
          />
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

function AccountItem(props: {
  setLoading: any;
  currentEmail: any;
  a: any;
  loading: any;
  auth: any;
  checked: any;
  setchecked: Function;
}) {
  const { checked, setchecked, setLoading, currentEmail, a, loading, auth } =
    props;
  const router = useRouter();
  return (
    <li
      className={loading && checked === a.email ? s.disabled : ""}
      onClick={async (e) => {
        e.stopPropagation();
        if (currentEmail === a.email) return;
        setLoading(true);
        setchecked(a.email);
        try {
          const messaging = getMessaging(app);
          await signout(messaging);
          await signInWithEmailAndPassword(auth, a.email, a.password);
          // router.replace("/");
          router.reload();
          setLoading(false);
        } catch (error: any) {
          setLoading(false);
          console.error(error);
          alert(error.message);
        }
      }}
    >
      <Image width={30} height={30} src="logo.svg" alt={a.email} />
      <div className={s.info}>
        <p>{a.email}</p>
        <p>
          {a.password} {a.default ? "(Default)" : ""}
        </p>
      </div>
      {checked === a.email && (
        <>
          {loading && checked !== currentEmail ? (
            <Spinner />
          ) : (
            <button title="Current Account">
              <div>
                <FontAwesomeIcon icon={faCheck} />
              </div>
            </button>
          )}
        </>
      )}
    </li>
  );
}
