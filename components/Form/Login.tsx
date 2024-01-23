import s from "@/components/Signup/index.module.scss";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
export default function LoginForm({ loading }: { loading: boolean }) {
  const [showPassword, setshowPassword] = useState(false);
  function togglePassword() {
    setshowPassword(!showPassword);
  }
  const title = "Login with Email";
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
          marginTop: "0",
        }}
      >
        {title}
      </h2>
      <input
        enterKeyHint="next"
        required
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
      <div className={s.password}>
        <input
          enterKeyHint="next"
          required
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
        <label htmlFor="password" className={s.passwordEye}>
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
      <button
        disabled={loading}
        type="submit"
        className={`w-full uppercase ${s.nextForm}`}
        aria-label="login"
      >
        {!loading ? "Login" : "Logging in"}
      </button>
    </>
  );
}
