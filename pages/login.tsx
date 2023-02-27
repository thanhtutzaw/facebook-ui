import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { app } from "../lib/firebase";
import { signin } from "../lib/signin";
import styles from "../styles/Home.module.css";
export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      } else {
        router.push("/login");
      }
    });
    return () => unsub();
  }, [auth]);
  // onAuthStateChanged(auth, (user) => {
  //   if (user) {
  //     router.push("/");
  //   } else {
  //     router.push("/login");
  //   }
  // });

  const email = "testuser@gmail.com";
  const password = "111111";
  return (
    <>
      <button
        className={styles.loginBtn}
        onClick={() => {
          setLoading(true);
          try {
            setTimeout(() => {
              console.log("signin");
              signin(email, password);
            }, 100);
          } catch (error) {
            setLoading(false);
            console.error(error);
          }
        }}
      >
        {loading ? "Loading..." : "Sign in as testUser"}
      </button>
    </>
  );
}
