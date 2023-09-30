import React, { FormEvent, FormEventHandler, useEffect, useState } from "react";
import NewAccount from "../../components/Signup/NewAccount";
import s from "../../components/Signup/index.module.scss";
import BackHeader from "../../components/Header/BackHeader";
import { signin } from "../../lib/signin";
import { useRouter } from "next/router";
import {
  AuthError,
  AuthErrorCodes,
  EmailAuthProvider,
  ErrorFn,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { app } from "../../lib/firebase";
import { motion } from "framer-motion";
import { FirebaseError } from "firebase/app";
import Link from "next/link";

export default function Email() {
  const router = useRouter();
  const [error, seterror] = useState("");
  const [loading, setloading] = useState(false);
  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
      } else {
        router.push("/");
        // console.log("expired , user exist and pushed");
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function handleEmailLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email")?.toString();
    const password = new FormData(e.currentTarget).get("password")?.toString();
    if (!email || !password) return;
    seterror("");
    setloading(true);
    try {
      const error = (await signin(email, password)) as FirebaseError;
      if (error) {
        seterror(error.code);
        console.error(error);
        setloading(false);
      } else {
      }
    } catch (error: any) {
      alert("Unexpected error occurred. Please try again later.");
      console.error(error);
    }
  }
  return (
    <div className="emailLogin">
      <BackHeader
        color={"white"}
        style={{ border: "0", backgroundColor: "transparent" }}
      />
      <motion.form
        className={`${s.emailForm}`}
        onSubmit={handleEmailLogin}
        key="label2"
        initial={{ opacity: 0, backgroundColor: "white" }}
        animate={{ opacity: 1, backgroundColor: "#1c7ff3" }}
        exit={{ opacity: 0 }}
        transition={{
          type: "spring",
          damping: 10,
          stiffness: 100,
        }}
        // transition={{ duration: 5 }}
        // animate={{ opacity: !signup ? 0 : 1, scale: !signup ? 0.5 : 1 }}
      >
        <div
          style={{
            boxShadow: "rgb(255 255 255 / 50%) 0px 5px 10px",
            position: "relative",
          }}
        >
          {error && (
            <>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: !error ? 0.5 : 1, opacity: !error ? 0 : 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className={s.error}
              >
                <h4
                  style={{ margin: "0", color: "red" }}
                >{`Error (${error})`}</h4>
                {error === AuthErrorCodes.USER_DELETED && (
                  <Link
                    style={{
                      color: "var(--blue-origin)",
                    }}
                    href="/login"
                  >
                    Create New Account
                  </Link>
                )}
              </motion.div>
            </>
          )}

          <NewAccount title="Login with Email" />
          <button
            disabled={loading}
            style={{ width: "100%", textTransform: "uppercase" }}
            type="submit"
            className={s.nextForm}
            aria-label="login"
          >
            {!loading ? "Login" : "Logging in"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
