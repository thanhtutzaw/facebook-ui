import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { app } from "../lib/firebase";
import { signin } from "../lib/signin";
import styles from "../styles/Home.module.scss";
export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      } else if (!user && router.pathname !== "/") {
        router.push("/login");
      }
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);
  const email = "testuser@gmail.com";
  const password = "111111";
  return (
    <>
      <button
        disabled={loading}
        className={styles.loginBtn}
        onClick={() => {
          setLoading(true);
          try {
            setTimeout(() => {
              signin(email, password);
            }, 700);
          } catch (error) {
            setLoading(false);
            console.error(error);
          }
        }}
      >
        {loading ? "Logging in..." : "Log in as testUser"}
      </button>
    </>
  );
}
