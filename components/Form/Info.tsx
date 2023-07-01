import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../../styles/Home.module.scss";
import { RefObject } from "react";
export default function Info(props: { emailRef: RefObject<HTMLInputElement> }) {
  const { emailRef } = props;
  return (
    <>
      <h2>Account Info</h2>
      <input
        onKeyDown={(e) => {
          if (e.key === " ") {
            // e.stopPropagation();
          }
        }}
        required={true}
        id="firstName"
        name="firstName"
        placeholder="First Name"
        // type={showPassword ? "text" : "password"}
      />
      <div className={styles.password}>
        <input
          onKeyDown={(e) => {
            if (e.key === " ") {
              // e.stopPropagation();
            }
          }}
          id="LastName"
          name="LastName"
          placeholder="Last Name (Optional)"
          // type={showPassword ? "text" : "password"}
        />
        {/* <label htmlFor="password" className={styles.passwordEye}>
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
        </label> */}
      </div>
      <button type="submit" className={styles.nextForm}>
        Done
      </button>
    </>
  );
}
