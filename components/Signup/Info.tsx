import { ChangeEventHandler, RefObject } from "react";
import styles from "./index.module.scss";
import { account } from "../../types/interfaces";
import Spinner from "../Spinner";
export default function Info(props: {
  signupLoading: boolean;
  handleChange: ChangeEventHandler<HTMLInputElement>;
  Account: account;
  setAccount: Function;
  emailRef: RefObject<HTMLInputElement>;
}) {
  const { signupLoading, handleChange, Account, setAccount, emailRef } = props;
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
          disabled={signupLoading}
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
          tabIndex={0}
          type="submit"
          className={styles.nextForm}
          aria-label="final step"
          style={{
            backgroundColor: signupLoading
              ? "transparent"
              : "var(--blue-origin)",
          }}
        >
          {signupLoading ? (
            <Spinner size={18} style={{ margin: "0" }} />
          ) : (
            "Done"
          )}
        </button>
      </div>
    </>
  );
}
