import { FirebaseError } from "firebase-admin";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { DevelopedByThanHtutZaw } from "../../components/DevelopedByThanHtutZaw";
import Signup from "../../components/Signup";
import useEscape from "../../hooks/useEscape";
import { app } from "../../lib/firebase";
import { signin } from "../../lib/signin";
import EmailIcon from "../../public/email.svg";
import styles from "../../styles/Home.module.scss";
import { addProfile } from "../../lib/profile";
import { Props, account } from "../../types/interfaces";
import { verifyIdToken } from "../../lib/firebaseAdmin";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import nookies from "nookies";
import { GetServerSideProps } from "next";
import Spinner from "../../components/Spinner";
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;
    // console.log(token.email + "in app.tsx");
    let expired = false;
    console.log(token.uid + " in app.tsx");
    return {
      props: {
        expired,
        uid: token.uid,
      },
    };
  } catch (error) {
    console.log("SSR Error (expired in app.tsx) " + error);
    // context.res.writeHead(302, { Location: "/" });
    // context.res.writeHead(302, { Location: "/login" });
    // context.res.end();
    return {
      props: {
        expired: true,
        uid: "",
      },
    };
  }
};
export default function Login({ uid }: { uid: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [adding, setadding] = useState(false);
  // const [Googleloading, setGoogleloading] = useState(false);
  const auth = getAuth(app);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      console.log(user, adding);
      if (user) {
        // router.push("/");
      }
      if (user && adding === false) {
        router.push("/");
      } else if (!user && router.pathname !== "/") {
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, adding]);
  // }, [auth, adding]);
  useEscape(() => {
    if (!signup) return;
    setsignup(false);
  });
  // const email = "testuser@gmail.com";
  // const password = "111111";
  const [signup, setsignup] = useState(false);
  const handleTestUserSignin = () => {
    setLoading(true);
    try {
      setTimeout(() => {
        signin("testuser@gmail.com", "111111");
      }, 700);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const emailRef = useRef<HTMLInputElement>(null);
  const [Account, setAccount] = useState<account>({
    email: "",
    password: "",
    profile: {
      firstName: "",
      lastName: "",
      bio: "",
      photoURL: "",
    },
  });
  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    // if (e.target.tagName === "INPUT") {
    //   return; // Ignore click event when typing in the input field
    // }
    // setAccount((prev) => ({
    //   ...prev,
    //   [name]: type === "checkbox" ? checked : value,
    // }));

    setAccount((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      profile: {
        ...prev.profile,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
    //     const emailMethod = await fetchSignInMethodsForEmail(auth, Account.email);
    // const emailExist = emailMethod.length > 0;
    // if(emailExist){
    //   const button = document.getElementsByTagName("button")[0]
    //   button.textContent = "Sign in"
    // }
  };
  const [emailLoading, setemailLoading] = useState(false);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password } = Account;
    const { firstName, lastName } = Account.profile;
    try {
      const emailMethod = await fetchSignInMethodsForEmail(auth, email);
      const emailExist = emailMethod.length > 0;
      // setemailExist(emailExist);
      const name = document.getElementsByName("firstName")[0];
      console.log("submit");
      // await createUserWithEmailAndPassword(auth, email, password);
      if (emailExist) {
        try {
          setemailLoading(true);
          const signinError = (await signin(email, password)) as FirebaseError;
          if (signinError) {
            setemailLoading(false);
            alert(signinError.code);
          }
        } catch (error: any) {
          alert(error.code);
          console.error(error.code);
        }
      } else {
        name.setAttribute("required", "true");
        if (firstName) {
          alert(JSON.stringify(Account, null, 4));

          const UserCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          setadding(true);
          try {
            await addProfile(UserCredential.user, Account.profile);
            setadding(false);
          } catch (error) {
            console.error(error);
          }
          // const user = UserCredential.user;
        } else {
          name.focus();
        }
      }
    } catch (error: any) {
      if (firstName) return;
      console.log(error.code);
    }
    // if (Account.firstName && !emailExist) {
    //   alert(JSON.stringify(Account, null, 4));
    // }
    try {
      // const UserCredential = await createUserWithEmailAndPassword(
      //   auth,
      //   email,
      //   Account.password
      // );
      // setsignup(false);
    } catch (error: any) {
      // if (error.code === "auth/email-already-in-use") {
      //   const email = document.getElementsByName("email")[0];
      //   email.focus();
      // }
      // setsignup(true);
    }

    // e.currentTarget.reset();
    // setAccount({
    //   email: "",
    //   password: "",
    //   firstName: "",
    //   lastName: "",
    // });
  };
  // if (uid) return <p style={{ textAlign: "center" }}>Loading ...</p>;
  return (
    <section className={styles.login}>
      {uid ? (
        <Spinner />
      ) : (
        <>
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
          <AnimatePresence mode="wait" initial={false}>
            {signup ? (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!signup) return;
                  setsignup(false);
                }}
                // key={"close"}
                className={styles.closeSignup}
                // transition={{ duration: 0.3, delay: 0.5 }}
                initial={{ opacity: 0, bottom: "-90px" }}
                animate={{
                  opacity: !signup ? 0 : 1,
                  bottom: signup ? "0px" : "-90px",
                }}
                exit={{ opacity: 0, bottom: "-90px" }}
              >
                {/* <FontAwesomeIcon icon={faX} /> */}
                &times;
              </motion.button>
            ) : (
              <motion.span
                key={"or"}
                className={styles.or}
                style={{ position: "relative", top: "-80px" }}
                // transition={{ delay: 1 }}
                // transition={{ duration: 1, delay: 1 }}
                initial={{ opacity: 1, top: "-80px" }}
                animate={{
                  opacity: signup ? 0 : 1,
                  // top: signup ? "-80px" : "0px",
                  top: "0px",
                }}
                exit={{ opacity: 0, top: "-80px" }}
              >
                or
              </motion.span>
            )}
          </AnimatePresence>
          <div
            tabIndex={-1}
            style={{
              maxWidth: "95vw",
              padding: !signup ? "0" : "13rem 7rem",
              transition: "padding .5s ease-in-out , scale .2s ease-in-out",
              scale: signup ? 1 : "initial",
              // minWidth:'260px'
            }}
            className={`${styles.loginBtn} ${styles.emailLogin}`}
            // disabled={signup}
            onKeyUp={(e) => {
              // console.log(e.currentTarget.tagName);
              if (e.code === "Space" || e.key === "Enter") {
                e.currentTarget.click();
                // alert("hey");
                // if (e.currentTarget.tagName === "Input") {
                //   e.stopPropagation();
                //   e.preventDefault();
                // }
              }
            }}
            onClick={(e) => {
              // if (!signup) {
              //   setsignup(true);
              // }
              // e.stopPropagation();
              // e.preventDefault();
              // if (e.target !== e.currentTarget) return;
              // console.log("clicking");
              // if (email !== "" || Account.password !== "") return;
              // if (e.target !== e.currentTarget && signup) return;
              // setsignup((prev) => !prev);
            }}
          >
            <AnimatePresence mode="wait">
              {!signup ? (
                <motion.button
                  onClick={(e) => {
                    if (!signup) {
                      setsignup(true);
                    }
                    e.stopPropagation();
                    e.preventDefault();
                    // if (e.target !== e.currentTarget) return;
                    // console.log("clicking");
                    // if (email !== "" || Account.password !== "") return;
                    // if (e.target !== e.currentTarget && signup) return;
                    // setsignup((prev) => !prev);
                  }}
                  className={styles.Loginlabel}
                  key="label"
                  initial={{
                    opacity: 1,
                    scale: 1,
                    height: "300px",
                    width: "300px",
                  }}
                  animate={{
                    opacity: signup ? 0 : 1,
                    scale: signup ? 1.3 : 1,
                    height: signup ? "300px" : "100%",
                    width: signup ? "500px" : "100%",
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1,
                    height: "300px",
                    width: "300px",
                  }}
                >
                  {/* <EmailIcon /> */}
                  {/* <div className="loginIcon"> */}
                  {/* <Image alt="Google-icon" src={GoogleIcon}></Image> */}
                  {/* </div> */}
                  {/* <GoogleLogo /> */}
                  <Image alt="email-logo" src={EmailIcon}></Image>
                  <p className="loginLabel">
                    {/* {Googleloading ? "Signing in" : "Continue with Google"} */}
                    {/* {Googleloading ? "Signing in" : "Sign up With Email"} */}
                    Sign up with Email
                  </p>
                </motion.button>
              ) : (
                <Signup
                  emailLoading={emailLoading}
                  handleSubmit={handleSubmit}
                  handleChange={handleChange}
                  signup={signup}
                  Account={Account}
                  setAccount={setAccount}
                  emailRef={emailRef}
                />
              )}
            </AnimatePresence>
          </div>
          <Link href="login/email" className={styles.emailLoginLink}>
            Log in using Email
          </Link>{" "}
        </>
      )}
      <DevelopedByThanHtutZaw signup={signup}/>
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
        <g
        // mask="url(#google_icon_svg__svg-3910113092-a)"
        >
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
