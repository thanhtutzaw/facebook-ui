import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { ChangeEventHandler, useState } from "react";
import styles from "./index.module.scss";
function NewAccount(props: {
  handleChange?: ChangeEventHandler<HTMLInputElement>;
  Account?: { email: string; password: string };
  title?: string;
  setAccount?: Function;
}) {
  const [showPassword, setshowPassword] = useState(false);
  // const accountRef = useRef({ email: "", password: "" });
  const { handleChange, title, Account, setAccount } = props;
  function togglePassword() {
    setshowPassword(!showPassword);
  }
  return (
    <>
      <h2
        className={`text-black
        overflow-hidden
        overflow-ellipsis
        text-[1.4rem]
        mt-[revert]
        text-center
        font-medium
        mb-2`}
        style={{
          // textAlign: title ? "center" : "initial",
          marginTop: title ? "0" : "revert",
        }}
      >
        {title ?? "Create New Account"}
      </h2>
      <input
        required
        onChange={handleChange}
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
      />
      <div className={styles.password}>
        <input
          required
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
          minLength={6}
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
    </>
  );
}

export default NewAccount;
