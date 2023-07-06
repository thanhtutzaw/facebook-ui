import { ChangeEventHandler, RefObject } from "react";
import { account } from "../../pages/login";
import styles from "./index.module.scss";
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
        type="text"
        autoComplete="on"
        spellCheck="false"
        tabIndex={0}
        aria-label="First name"
        autoCapitalize="sentences"
      />

      <input
        onChange={handleChange}
        id="lastName"
        name="lastName"
        placeholder="Last Name (Optional)"
        minLength={3}
        maxLength={20}
      />
      <div className={styles.backbtnContainer}>
        <button
          tabIndex={1}
          onClick={(e) => {
            e.preventDefault();
            const previousElement =
              e.currentTarget.parentElement?.parentElement
                ?.previousElementSibling;
            previousElement?.scrollIntoView({ block: "center" });
          }}
          // type="submit"
          className={styles.nextForm}
          aria-label="back step"
        >
          Back
        </button>
        <button
          // onClick={(e) => {
          //   e.preventDefault();
          //   alert("hey");
          // }}
          tabIndex={0}
          type="submit"
          className={styles.nextForm}
          aria-label="final step"
        >
          Done
        </button>
      </div>
    </>
  );
}
