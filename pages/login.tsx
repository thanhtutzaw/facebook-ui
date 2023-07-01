import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import { CSSProperties, useEffect, useState } from "react";
import { app } from "../lib/firebase";
import { signin } from "../lib/signin";
import styles from "../styles/Home.module.scss";
export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [Googleloading, setGoogleloading] = useState(false);
  const auth = getAuth(app);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      } else if (!user && router.pathname !== "/") {
        // router.push("/login");
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  const email = "testuser@gmail.com";
  const password = "111111";
  const [signup, setsignup] = useState(false);
  const loginStyle: CSSProperties = {};
  const handleTestUserSignin = () => {
    setLoading(true);
    try {
      setTimeout(() => {
        signin(email, password);
      }, 700);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };
  const [showPassword, setshowPassword] = useState(false);
  function togglePassword() {
    setshowPassword(!showPassword);
    // if (showPassword) {
    //   setshowPassword(false);
    // } else {
    //   setshowPassword(true);
    // }
  }
  if (auth.currentUser)
    return <p style={{ textAlign: "center" }}>Loading ...</p>;
  return (
    <section className={styles.login}>
      <button
        aria-label="Log in as Peter 1"
        disabled={loading}
        className={styles.SecondaryloginBtn}
        onClick={handleTestUserSignin}
      >
        <Image
          width={200}
          height={170}
          style={{
            objectFit: "cover",
            width: "30%",
            height: "50px",
            borderRadius: "100px",
          }}
          alt="testuser photo"
          src={
            "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
          }
        />
        {loading ? "Logging in..." : "Log in as Peter 1"}
      </button>
      or
      <button
        style={{
          padding: !signup ? "1rem" : "10rem 7rem",
          transition: "padding .5s ease-in-out , scale .2s ease-in-out",
          scale: signup ? 1 : "initial",
        }}
        className={`${styles.loginBtn} ${styles.emailLogin}`}
        disabled={Googleloading}
        // style={loginStyle}

        onClick={(e) => {
          if (!signup) {
            setsignup(true);
          }
          if (e.target !== e.currentTarget) return;
          setsignup((prev) => !prev);
        }}
      >
        <AnimatePresence mode="wait">
          {!signup ? (
            <motion.div
              className={styles.Loginlabel}
              key="label"
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: signup ? 0 : 1, scale: signup ? 1.3 : 1 }}
              exit={{ opacity: 0, scale: 1 }}
            >
              <SignupLabel />
            </motion.div>
          ) : (
            <motion.div
              key="label2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: !signup ? 0 : 1, scale: !signup ? 0.5 : 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={styles.emailForm}
            >
              <input placeholder="Email" type="email" />
              <div className={styles.password}>
                <input
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                />
                <div className={styles.passwordEye}>
                  <AnimatePresence mode="wait">
                    {showPassword ? (
                      <motion.div
                        key="label3"
                        initial={{ opacity: 1 }}
                        animate={{
                          opacity: !showPassword ? 0 : 1,
                        }}
                        exit={{ opacity: 0 }}
                        aria-label="showPassword"
                        onClick={togglePassword}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="label4"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: showPassword ? 0 : 1,
                        }}
                        exit={{ opacity: 0 }}
                        aria-label="hidePassword"
                        onClick={togglePassword}
                      >
                        <FontAwesomeIcon icon={faEyeSlash} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
      <a className={styles.emailLoginLink}>Log in using Email</a>
      <a
        className="githublink"
        href="https://github.com/thanhtutzaw"
        target="_blank"
        rel="noreferrer"
      >
        <span
          style={{
            color: "gray",
          }}
        >
          Developed by{" "}
        </span>
        thanhtutzaw
      </a>
    </section>
  );
}
function GoogleLogo() {
  return (
    <div className="loginIcon">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M.956 4.965c.362-.808.874-1.513 1.474-2.15C3.79 1.372 5.433.448 7.38.133c2.724-.441 5.163.21 7.27 2.049.133.116.166.184.022.328-.744.738-1.476 1.488-2.213 2.234-.075.077-.126.17-.26.045-1.856-1.723-4.884-1.703-6.855.155a5.747 5.747 0 00-1.474 2.28c-.046-.031-.094-.059-.137-.092L.956 4.965z"
          fill="#D7282A"
        ></path>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.848 10.742c.266.685.596 1.332 1.088 1.882 1.249 1.398 2.797 2 4.652 1.806.861-.091 1.647-.387 2.38-.841.07.063.138.131.212.19.859.68 1.718 1.358 2.578 2.036a7.352 7.352 0 01-3.326 1.842c-2.968.76-5.703.28-8.133-1.663a8.337 8.337 0 01-2.35-2.97l2.899-2.282z"
          fill="#45AC43"
        ></path>
        <mask
          id="google_icon_svg__svg-3910113092-a"
          maskUnits="userSpaceOnUse"
          x="8"
          y="7"
          width="10"
          height="9"
          style={{ maskType: "alpha" }}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17.402 7.299v8.515H8.858V7.3h8.544z"
            fill="#fff"
          ></path>
        </mask>
        <g mask="url(#google_icon_svg__svg-3910113092-a)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.76 15.814c-.86-.678-1.72-1.356-2.579-2.036-.074-.059-.14-.127-.211-.19.582-.45 1.067-.983 1.386-1.66.127-.269.217-.551.301-.837.058-.196.04-.273-.2-.27-1.43.011-2.86.005-4.291.005-.303 0-.303 0-.303-.318 0-.982.004-1.965-.005-2.947-.001-.19.032-.263.242-.262 2.639.008 5.277.006 7.915.002.143 0 .232.01.257.186.329 2.34.065 4.574-1.142 6.638-.37.632-.814 1.209-1.37 1.69z"
            fill="#4385F5"
          ></path>
        </g>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.85 10.743l-2.9 2.282c-.472-.89-.745-1.845-.872-2.84a9 9 0 01.744-4.966c.04-.087.09-.169.135-.253.925.722 1.85 1.445 2.777 2.167.043.034.091.06.137.091-.387 1.17-.368 2.344-.022 3.519z"
          fill="#F4C300"
        ></path>
      </svg>
    </div>
  );
}

function SignupLabel() {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24px"
        height="24px"
        viewBox="0 0 24 24"
        fill="#FFFFFF"
      >
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        <path d="M0 0h24v24H0z" fill="none" />
      </svg>
      <p className="loginLabel">
        {/* {Googleloading ? "Signing in" : "Continue with Google"} */}
        {/* {Googleloading ? "Signing in" : "Sign up With Email"} */}
        Sign up With Email
      </p>
    </>
  );
}
