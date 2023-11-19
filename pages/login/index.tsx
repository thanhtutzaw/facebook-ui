import useLogin from "@/hooks/useLogin";
import { app } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { DevelopedByThanHtutZaw } from "../../components/DevelopedByThanHtutZaw";
import Signup from "../../components/Signup";
import signupStyles from "../../components/Signup/index.module.scss";
import Spinner from "../../components/Spinner";
import EmailIcon from "../../public/email.svg";
import styles from "../../styles/Home.module.scss";
import Metatag from "@/components/Metatag";
// export const getServerSideProps: GetServerSideProps<AppProps> = async (
//   context
// ) => {
//   try {
//     const cookies = nookies.get(context);
//     const token = await verifyIdToken(cookies.token);
//     console.log(token.uid + " in app.tsx");
//     return {
//       props: {
//         uid: token.uid,
//       },
//     };
//   } catch (error) {
//     console.log("SSR Error (expired in app.tsx) " + error);
//     // context.res.writeHead(302, { Location: "/" });
//     // context.res.writeHead(302, { Location: "/login" });
//     // context.res.end();
//     return {
//       props: {
//         uid: "",
//       },
//     };
//   }
// };
export default function Login() {
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
  const auth = getAuth(app);
  const uid = auth.currentUser?.uid;
  return (
    <>
      <Metatag
        title={`Login | Facebook Next`}
        description={`Login | Facebook-Mobile-UI with Next.js`}
      />
      <section
        className={` h-[100dvh] flex flex-col justify-center items-center gap-4 ${styles.login}`}
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
                className="bg-avatarBg/50"
                width={200}
                height={170}
                style={{
                  objectFit: "cover",
                  width: "70px",
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
                            className={`m-[2_0_0] text-red`}
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
    </>
  );
}
