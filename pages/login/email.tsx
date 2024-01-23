import LoginForm from "@/components/Form/Login";
import { AuthErrorCodes, getAuth, onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import BackHeader from "../../components/Header/BackHeader";
import s from "../../components/Signup/index.module.scss";
import { app } from "../../lib/firebase";
import { signin } from "../../lib/signin";

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
  }, [router]);
  async function handleEmailLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email")?.toString();
    const password = new FormData(e.currentTarget).get("password")?.toString();
    if (!email || !password) return;
    seterror("");
    setloading(true);
    try {
      const { signinError } = await signin(email, password);
      if (signinError) {
        seterror(signinError.code);
        console.error(signinError);
        setloading(false);
      } else {
      }
    } catch (error: unknown) {
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
      >
        <div
          style={{
            boxShadow: "rgb(255 255 255 / 50%) 0px 5px 10px",
            position: "relative",
          }}
        >
          {error && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: !error ? 0.5 : 1, opacity: !error ? 0 : 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={s.error}
            >
              <h4 className="m-0 text-red-500">{`Error (${error})`}</h4>
              {error === AuthErrorCodes.USER_DELETED && (
                <Link className="text-primary" href="/login">
                  Create New Account
                </Link>
              )}
            </motion.div>
          )}

          <LoginForm loading={loading} />
          
        </div>
      </motion.form>
    </div>
  );
}
