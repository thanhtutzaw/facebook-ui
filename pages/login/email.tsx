import React, { FormEvent, FormEventHandler, useEffect } from "react";
import NewAccount from "../../components/Signup/NewAccount";
import s from "../../components/Signup/index.module.scss";
import BackHeader from "../../components/Header/BackHeader";
import { signin } from "../../lib/signin";
import { useRouter } from "next/router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../lib/firebase";
export default function Email() {
  const router = useRouter();
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

  function handleEmailLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    const password = new FormData(e.currentTarget).get("password");
    try {
      signin(email, password);
    } catch (error) {
      alert(error);
      console.error(error);
    }
    // new FormData(e.currentTarget).get("password")
  }
  return (
    <>
      {/* <section className={s.login}> */}
      <BackHeader style={{ border: "0", backgroundColor: "transparent" }} />
      <form
        className={`${s.emailForm}`}
        onSubmit={handleEmailLogin}
        key="label2"
        // initial={{ opacity: 0, scale: 0.5 }}
        // animate={{ opacity: !signup ? 0 : 1, scale: !signup ? 0.5 : 1 }}
        // exit={{ opacity: 0, scale: 0.5 }}
        // className={s.emailForm}
      >
        <div style={{ boxShadow: "0 5px 10px #a5a5a5" }}>
          <NewAccount title="Log in with Email" />
          <button type="submit" className={s.nextForm}>
            Next
          </button>
        </div>
      </form>
      {/* </section> */}
    </>
  );
}
