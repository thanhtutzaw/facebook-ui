import Spinner from "@/components/Spinner";
import { useAppContext } from "@/context/AppContext";
import { usePageContext } from "@/context/PageContext";
import { app } from "@/lib/firebase";
import { signout } from "@/lib/signout";
import {
  faAngleDown,
  faAngleUp,
  faCheck,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getMessaging } from "firebase/messaging";
import Image from "next/image";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
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
  const { auth } = usePageContext();
  const { token } = useAppContext();
  const { email: currentEmail } = { ...token };

  const [toggleSwitchAcc, setToggleSwitchAcc] = useState(false);
  const [checkedEmail, setcheckedEmail] = useState(currentEmail);

  return (
    <div
      style={{
        height: !toggleSwitchAcc ? "65px" : "300px",
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
            checkedEmail={checkedEmail}
            setcheckedEmail={setcheckedEmail}
            loading={loading}
            auth={auth}
          />
        ))}
      </ul>
      <footer>
        <p className={`text-dimgray text-[15px] p-[0_1rem] m-[.5rem_0]`}>
          <FontAwesomeIcon icon={faInfoCircle} /> Switch account for testing
        </p>
      </footer>
    </div>
  );
}

function AccountItem(props: {
  setLoading: Function;
  currentEmail: DecodedIdToken["email"];
  a: any;
  loading: boolean;
  auth: any;
  checkedEmail: string | undefined;
  setcheckedEmail: Dispatch<SetStateAction<string | undefined>>;
}) {
  const {
    checkedEmail,
    setcheckedEmail,
    setLoading,
    currentEmail,
    a,
    loading,
    auth,
  } = props;
  const router = useRouter();
  return (
    <li
      className={loading && checkedEmail === a.email ? s.disabled : ""}
      onClick={async (e) => {
        e.stopPropagation();
        if (currentEmail === a.email) return;
        setLoading(true);
        setcheckedEmail(a.email);
        try {
          const messaging = getMessaging(app);
          await signout(messaging);
          await signInWithEmailAndPassword(auth, a.email, a.password);
          // router.replace("/");
          router.reload();
          setLoading(false);
        } catch (error: unknown) {
          setLoading(false);
          console.error(error);
          alert(error);
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
      {checkedEmail === a.email && (
        <>
          {loading && checkedEmail !== currentEmail ? (
            <Spinner style={{ margin: "0" }} />
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
