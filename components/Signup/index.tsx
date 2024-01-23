import { motion } from "framer-motion";
import { ChangeEventHandler, FormEventHandler } from "react";
import Info from "./Info";
import SignupForm from "./SignupForm";
import styles from "./index.module.scss";
import { account } from "@/types/interfaces";
export default function Signup(props: {
  signupLoading: boolean;
  onSignUp: FormEventHandler<HTMLFormElement>;
  handleChange: ChangeEventHandler<HTMLInputElement>;
  toggleSignUp: boolean;
  Account: account;
  setAccount: Function;
  emailLoading: boolean;
}) {
  const {
    signupLoading,
    emailLoading,
    onSignUp,
    handleChange,
    toggleSignUp,
    Account,
    setAccount,
  } = props;
  return (
    <motion.form
      onClick={(e) => {
        e.stopPropagation();
      }}
      onSubmit={onSignUp}
      key="label2"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: !toggleSignUp ? 0 : 1,
        scale: !toggleSignUp ? 0.5 : 1,
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      className={`
        ${styles.emailForm}`}
    >
      <SignupForm loading={emailLoading} handleChange={handleChange} />
      <div className={styles.userInfo}>
        <Info
          signupLoading={signupLoading}
          handleChange={handleChange}
          Account={Account}
          setAccount={setAccount}
        />
      </div>
    </motion.form>
  );
}
