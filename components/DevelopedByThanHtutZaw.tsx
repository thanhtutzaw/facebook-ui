import { AnimatePresence, motion } from "framer-motion";

export function DevelopedByThanHtutZaw({
  toggleSignUp,
}: {
  toggleSignUp?: boolean;
}) {
  return (
    <AnimatePresence>
      {!toggleSignUp && (
        <motion.a
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: toggleSignUp ? 80 : 0, opacity: toggleSignUp ? 0 : 1 }}
          exit={{
            y: 80,
            opacity: 0,
          }}
          transition={{ duration: toggleSignUp ? 0.4 : 0.8 }}
          tabIndex={-1}
          className={"absolute bottom-0 p-4 text-base text-primary"}
          href="https://github.com/thanhtutzaw"
          target="_blank"
          rel="noreferrer"
        >
          <span
            style={{
              color: "gray",
              userSelect: "none",
            }}
          >
            Developed by{" "}
          </span>
          thanhtutzaw
        </motion.a>
      )}
    </AnimatePresence>
  );
}
