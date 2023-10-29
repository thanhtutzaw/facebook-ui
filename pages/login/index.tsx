import useLogin from "@/hooks/useLogin";
import { AnimatePresence, motion } from "framer-motion";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import nookies from "nookies";
import { DevelopedByThanHtutZaw } from "../../components/DevelopedByThanHtutZaw";
import Signup from "../../components/Signup";
import signupStyles from "../../components/Signup/index.module.scss";
import Spinner from "../../components/Spinner";
import { verifyIdToken } from "../../lib/firebaseAdmin";
import EmailIcon from "../../public/email.svg";
import styles from "../../styles/Home.module.scss";
import { AppProps } from "../../types/interfaces";
export const getServerSideProps: GetServerSideProps<AppProps> = async (
  context
) => {
  try {
    const cookies = nookies.get(context);
    const token = await verifyIdToken(cookies.token);
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
  const {
    testUserSigninLoading,
    handleTestUserSignin,
    toggleSignUp,
    settoggleSignUp,
    error,
    signupLoading,
    handleSubmit,
    handleChange,
    Account,
    setAccount,
    emailLoading,
    emailRef,
  } = useLogin();
  return (
    <section
      className={` h-[100dvh]
    flex flex-col justify-center items-center gap-4 ${styles.login}`}
    >
      {uid ? (
        <Spinner fullScreen />
      ) : (
        <>
          <button
            aria-label="Log in as Peter 1"
            disabled={testUserSigninLoading}
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
            {testUserSigninLoading ? "Logging in..." : "Log in as Peter 1"}
          </button>
          <AnimatePresence mode="wait" initial={false}>
            {toggleSignUp ? (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!toggleSignUp) return;
                  settoggleSignUp(false);
                }}
                className={`font-['Arial,_Helvetica,_sans-serif']
                bg-primary text-white border-none p-2 flex w-9 justify-center items-center h-9 rounded-full relative opacity-0 text-3xl active:opacity-50 transition-opacity duration-300 ease-in-out`}
                initial={{ opacity: 0, bottom: "-90px" }}
                animate={{
                  opacity: !toggleSignUp ? 0 : 1,
                  bottom: toggleSignUp ? "0px" : "-90px",
                }}
                exit={{ opacity: 0, bottom: "-90px" }}
              >
                &times;
              </motion.button>
            ) : (
              <motion.span
                key={"or"}
                className={`relative select-none`}
                style={{ position: "relative", top: "-80px" }}
                initial={{ opacity: 1, top: "-80px" }}
                animate={{
                  opacity: toggleSignUp ? 0 : 1,
                  // top: toggleSignUp ? "-80px" : "0px",
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
              padding: !toggleSignUp ? "0" : "13rem 7rem",
              transition: "padding .5s ease-in-out , scale .2s ease-in-out",
              scale: toggleSignUp ? 1 : "initial",
              // minWidth:'260px'
            }}
            className={`${styles.loginBtn} ${styles.emailLogin}`}
            onKeyUp={(e) => {
              if (e.code === "Space" || e.key === "Enter") {
                e.currentTarget.click();
              }
            }}
          >
            <AnimatePresence mode="wait">
              {!toggleSignUp ? (
                <motion.button
                  onClick={(e) => {
                    if (!toggleSignUp) {
                      settoggleSignUp(true);
                    }
                    e.stopPropagation();
                    e.preventDefault();
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
                    opacity: toggleSignUp ? 0 : 1,
                    scale: toggleSignUp ? 1.3 : 1,
                    height: toggleSignUp ? "300px" : "100%",
                    width: toggleSignUp ? "500px" : "100%",
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1,
                    height: "300px",
                    width: "300px",
                  }}
                >
                  <Image alt="email-logo" src={EmailIcon}></Image>
                  <p className="loginLabel">Sign up with Email</p>
                </motion.button>
              ) : (
                <div style={{ position: "relative" }}>
                  {error && (
                    <>
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{
                          scale: !error ? 0.5 : 1,
                          opacity: !error ? 0 : 1,
                        }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className={signupStyles.error}
                      >
                        <h4
                          style={{
                            margin: "0",
                            color: "red",
                            marginTop: ".5rem",
                          }}
                        >{`Error (${error})`}</h4>
                        {/* {error === AuthErrorCodes.USER_DELETED && (
                          <Link
                            style={{
                              color: "var(--blue-origin)",
                            }}
                            href="/login"
                          >
                            Create New Account
                          </Link>
                        )} */}
                      </motion.div>
                    </>
                  )}
                  <Signup
                    signupLoading={signupLoading}
                    emailLoading={emailLoading}
                    handleSubmit={handleSubmit}
                    handleChange={handleChange}
                    toggleSignUp={toggleSignUp}
                    Account={Account}
                    setAccount={setAccount}
                    emailRef={emailRef}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
          <Link
            href="login/email"
            className={
              "text-primary underline cursor-pointer select-none focus-visible:outline-primary "
            }
          >
            Log in using Email
          </Link>{" "}
        </>
      )}
      <DevelopedByThanHtutZaw toggleSignUp={toggleSignUp} />
    </section>
  );
}
// function GoogleLogo() {
//   return (
//     <div className="loginIcon">
//       <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
//         <path
//           fillRule="evenodd"
//           clipRule="evenodd"
//           d="M.956 4.965c.362-.808.874-1.513 1.474-2.15C3.79 1.372 5.433.448 7.38.133c2.724-.441 5.163.21 7.27 2.049.133.116.166.184.022.328-.744.738-1.476 1.488-2.213 2.234-.075.077-.126.17-.26.045-1.856-1.723-4.884-1.703-6.855.155a5.747 5.747 0 00-1.474 2.28c-.046-.031-.094-.059-.137-.092L.956 4.965z"
//           fill="#D7282A"
//         ></path>
//         <path
//           fillRule="evenodd"
//           clipRule="evenodd"
//           d="M3.848 10.742c.266.685.596 1.332 1.088 1.882 1.249 1.398 2.797 2 4.652 1.806.861-.091 1.647-.387 2.38-.841.07.063.138.131.212.19.859.68 1.718 1.358 2.578 2.036a7.352 7.352 0 01-3.326 1.842c-2.968.76-5.703.28-8.133-1.663a8.337 8.337 0 01-2.35-2.97l2.899-2.282z"
//           fill="#45AC43"
//         ></path>
//         <mask
//           id="google_icon_svg__svg-3910113092-a"
//           maskUnits="userSpaceOnUse"
//           x="8"
//           y="7"
//           width="10"
//           height="9"
//           style={{ maskType: "alpha" }}
//         >
//           <path
//             fillRule="evenodd"
//             clipRule="evenodd"
//             d="M17.402 7.299v8.515H8.858V7.3h8.544z"
//             fill="#fff"
//           ></path>
//         </mask>
//         <g
//         // mask="url(#google_icon_svg__svg-3910113092-a)"
//         >
//           <path
//             fillRule="evenodd"
//             clipRule="evenodd"
//             d="M14.76 15.814c-.86-.678-1.72-1.356-2.579-2.036-.074-.059-.14-.127-.211-.19.582-.45 1.067-.983 1.386-1.66.127-.269.217-.551.301-.837.058-.196.04-.273-.2-.27-1.43.011-2.86.005-4.291.005-.303 0-.303 0-.303-.318 0-.982.004-1.965-.005-2.947-.001-.19.032-.263.242-.262 2.639.008 5.277.006 7.915.002.143 0 .232.01.257.186.329 2.34.065 4.574-1.142 6.638-.37.632-.814 1.209-1.37 1.69z"
//             fill="#4385F5"
//           ></path>
//         </g>
//         <path
//           fillRule="evenodd"
//           clipRule="evenodd"
//           d="M3.85 10.743l-2.9 2.282c-.472-.89-.745-1.845-.872-2.84a9 9 0 01.744-4.966c.04-.087.09-.169.135-.253.925.722 1.85 1.445 2.777 2.167.043.034.091.06.137.091-.387 1.17-.368 2.344-.022 3.519z"
//           fill="#F4C300"
//         ></path>
//       </svg>
//     </div>
//   );
// }
