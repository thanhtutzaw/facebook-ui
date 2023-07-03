import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./index.module.scss";
import { ChangeEventHandler, RefObject } from "react";
import { account } from "../../pages/login";
export default function Info(props: {
  handleChange: ChangeEventHandler<HTMLInputElement>;
  Account: account;
  setAccount: Function;
  emailRef: RefObject<HTMLInputElement>;
}) {
  const { handleChange, Account, setAccount, emailRef } = props;
  return (
    <>
      <h2>Account Info</h2>
      <input
        // onChange={(e) => {
        //   // setAccount({...Account  , firstName: e.target.value})
        // }}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === " ") {
            // e.stopPropagation();
          }
        }}
        id="firstName"
        name="firstName"
        placeholder="First Name"
        minLength={3}
        maxLength={20}
      />
      <input
        // onChange={(e) => {
        //   // setAccount({...Account , lastName: e.target.value })
        // }}
        onChange={handleChange}
        id="lastName"
        name="lastName"
        placeholder="Last Name (Optional)"
        minLength={3}
        maxLength={20}
      />
      <div className={styles.backbtnContainer}>
        <button
          onClick={(e) => {
            e.preventDefault();
            const previousElement =
              e.currentTarget.parentElement?.parentElement
                ?.previousElementSibling;
            previousElement?.scrollIntoView({ block: "center" });
          }}
          // type="submit"
          className={styles.nextForm}
        >
          Back
        </button>
        <button
          // onClick={(e) => {
          //   e.preventDefault();
          //   alert("hey");
          // }}
          type="submit"
          className={styles.nextForm}
        >
          Done
        </button>
      </div>
    </>
  );
}
