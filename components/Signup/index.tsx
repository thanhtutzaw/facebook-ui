import React, { ChangeEventHandler } from "react";
import NewAccount from "./NewAccount";
import Info from "./Info";
import styles from "../../styles/Home.module.css";
export default function Signup(props: {
  handleChange: ChangeEventHandler<HTMLInputElement>;
  signup: any;
  Account: any;
  setAccount: any;
  emailRef: any;
}) {
  const { handleChange, signup, Account, setAccount, emailRef } = props;
  return (
    <>
      <div className={styles.newAccount}>
        <NewAccount
          handleChange={handleChange}
          // key={signup ? "true" : "false"}
          Account={Account}
          setAccount={setAccount}
          emailRef={emailRef}
        />
      </div>
      <div className={styles.userInfo}>
        <Info
          handleChange={handleChange}
          Account={Account}
          setAccount={setAccount}
          emailRef={emailRef}
        />
      </div>
    </>
  );
}
