import { motion } from "framer-motion";
import { ChangeEventHandler, FormEventHandler } from "react";
import styles from "./index.module.scss";
import Info from "./Info";
import NewAccount from "./NewAccount";
export default function Signup(props: {
  signupLoading:boolean;
  handleSubmit: FormEventHandler<HTMLFormElement>;
  handleChange: ChangeEventHandler<HTMLInputElement>;
  toggleSignUp: boolean;
  Account: any;
  setAccount: Function;
  emailLoading: boolean;
  emailRef: any;
}) {
  const {
    signupLoading,
    emailLoading,
    handleSubmit,
    handleChange,
    toggleSignUp,
    Account,
    setAccount,
    emailRef,
  } = props;
  return (
    <motion.form
      onClick={(e) => {
        e.stopPropagation();
      }}
      onSubmit={handleSubmit}
      key="label2"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: !toggleSignUp ? 0 : 1, scale: !toggleSignUp ? 0.5 : 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className={styles.emailForm}
    >
      <div className={styles.newAccount}>
        <NewAccount
          handleChange={handleChange}
          Account={Account}
          setAccount={setAccount}
          emailRef={emailRef}
        />
        <button
          onClick={(e) => {
            // const nextElement =
            //   e.currentTarget.parentElement?.nextElementSibling;
            // nextElement?.scrollIntoView({ block: "center" });
          }}
          type="submit"
          className={styles.nextForm}
          aria-label="next step"
        >
          {emailLoading ? "Signing in..." : "Next"}
        </button>
      </div>
      <div className={styles.userInfo}>
        <Info
          signupLoading={signupLoading}
          handleChange={handleChange}
          Account={Account}
          setAccount={setAccount}
          emailRef={emailRef}
        />
      </div>
    </motion.form>
  );
}
