import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../../styles/Home.module.scss";
import { RefObject, useState } from "react";
function NewAccount(props: { emailRef: RefObject<HTMLInputElement> }) {
  const [showPassword, setshowPassword] = useState(false);

  const { emailRef } = props;
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
      <h2>Create New Account</h2>
      <input
        onKeyDown={(e) => {
          if (e.key === " ") {
            // e.stopPropagation();
          }
        }}
        // required={true}
        autoFocus
        ref={emailRef}
        placeholder="Email"
        type="email"
      />
      <div className={styles.password}>
        <input
          onKeyDown={(e) => {
            if (e.key === " ") {
              // e.stopPropagation();
            }
          }}
          //   required={true}
          id="password"
          name="password"
          placeholder="Password"
          type={showPassword ? "text" : "password"}
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
