import React, { FormEvent, FormEventHandler, useEffect, useState } from "react";
import NewAccount from "../../components/Signup/NewAccount";
import s from "../../components/Signup/index.module.scss";
import BackHeader from "../../components/Header/BackHeader";
import { signin } from "../../lib/signin";
import { useRouter } from "next/router";
import {
  ErrorFn,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { app } from "../../lib/firebase";
import { motion } from "framer-motion";
import error from "next/error";
import { FirebaseError } from "firebase/app";

export default function Email() {
  const router = useRouter();
  const [error, seterror] = useState("");
  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // router.push("/login");
      } else {
        router.push("/");
        // console.log("expired , user exist and pushed");
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const auth = getAuth(app);
  async function handleEmailLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email")?.toString();
    const password = new FormData(e.currentTarget).get("password")?.toString();
    if (!email || !password) return;
    seterror("");
    try {
      const error = (await signin(email, password)) as FirebaseError;

      if (error) {
        seterror(`Error (${error.code})`);
        console.error(error);
      }
    } catch (error: any) {
      alert("Unexpected error occurred. Please try again later.");
      console.error(error);
    }
  }
  return (
    <>
      {/* <section className={s.login}> */}
      <BackHeader style={{ border: "0", backgroundColor: "#ffffff36" }} />
      <form
        className={`${s.emailForm}`}
        onSubmit={handleEmailLogin}
        key="label2"
        // initial={{ opacity: 0, scale: 0.5 }}
        // animate={{ opacity: !signup ? 0 : 1, scale: !signup ? 0.5 : 1 }}
        // exit={{ opacity: 0, scale: 0.5 }}
        // className={s.emailForm}
      >
        <div
          style={{
            boxShadow: "0 5px 10px #a5a5a5",
            position: "relative",
          }}
        >
          {error && (
            <motion.h4
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: !error ? 0.5 : 1, opacity: !error ? 0 : 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={s.error}
              style={{ margin: "0", color: "red" }}
            >
              {error}
            </motion.h4>
          )}

          <NewAccount title="Log in with Email" />
          <button
            style={{ width: "100%" }}
            type="submit"
            className={s.nextForm}
          >
            Login
          </button>
        </div>
      </form>
      {/* </section> */}
    </>
  );
}
