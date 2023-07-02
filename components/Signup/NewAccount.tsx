import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../../styles/Home.module.scss";
import { ChangeEventHandler, RefObject, useRef, useState } from "react";
function NewAccount(props: {
  handleChange?: ChangeEventHandler<HTMLInputElement>;
  Account?: { email: string; password: string };
  title?: string;
  setAccount?: Function;
  emailRef?: RefObject<HTMLInputElement>;
}) {
  const [showPassword, setshowPassword] = useState(false);
  // const accountRef = useRef({ email: "", password: "" });
  const { handleChange, title, emailRef, Account, setAccount } = props;
  function togglePassword() {
    setshowPassword(!showPassword);
    // if (showPassword) {
    //   setshowPassword(false);
    // } else {
    //   setshowPassword(true);
    // }
  }
  return (
    <>
      <h2>{title ?? "Create New Account"}</h2>
      <input
        // ref={accountRef.current.email}
        // onChange={(e) => {
        //   // setAccount?.({ ...Account, email: e.target.value });
        //   // accountRef.current.email = e.target.value;
        //   // if (e.key === " ") {
        //   // e.stopPropagation();
        //   // }
        // }}
        onChange={handleChange}
        // ref={emailRef}
        autoFocus
        placeholder="Email"
        aria-invalid="false"
        autoComplete="username"
        id="email"
        name="email"
        type="email"
        dir="ltr"
        inputMode="email"
        aria-label="Email Address"
        aria-errormessage="email-error"
        maxLength={1000}
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
        // value={Account?.email}
        // value={accountRef.current.email}
      ></input>
      <div className={styles.password}>
        <input
          required
          // value={Account?.password}
          // onChange={(e) => {
          //   // setAccount?.({ ...Account, password: e.target.value });
          //   // if (e.key === " ") {
          //   // e.stopPropagation();
          //   // }
          // }}
          onChange={handleChange}
          placeholder="Password"
          autoComplete="current-password"
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          dir="ltr"
          inputMode="text"
          aria-label="Password"
          aria-errormessage="password-error"
          minLength={3}
          maxLength={1000}
          aria-invalid="true"
          aria-describedby="password-helper-text"
        />
        <label htmlFor="password" className={styles.passwordEye}>
          <AnimatePresence mode="wait">
            {showPassword ? (
              <motion.div
                key="label3"
                initial={{
                  opacity: 1,
                }}
                animate={{
                  opacity: !showPassword ? 0 : 1,
                }}
                exit={{
                  opacity: 0,
                }}
                aria-label="showPassword"
                onClick={togglePassword}
              >
                <FontAwesomeIcon icon={faEye} />
              </motion.div>
            ) : (
              <motion.div
                key="label4"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: showPassword ? 0 : 1,
                }}
                exit={{
                  opacity: 0,
                }}
                aria-label="hidePassword"
                onClick={togglePassword}
              >
                <FontAwesomeIcon icon={faEyeSlash} />
              </motion.div>
            )}
          </AnimatePresence>
        </label>
      </div>
      <button type="submit" className={styles.nextForm}>
        Next
      </button>
    </>
  );
}

export default NewAccount;
