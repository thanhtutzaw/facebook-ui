import { motion } from "framer-motion";
import styles from "@/components/Post/index.module.scss";
import s from "./index.module.scss";
import useEscape from "@/hooks/useEscape";
export default function SortDate(props: {
  toggleSort: boolean;
  sortby: string;
  setToggleSort: Function;
  setsortby: Function;
}) {
  const { toggleSort, sortby, setToggleSort, setsortby } = props;
  useEscape(() => {
    if (toggleSort) setToggleSort(false);
  });
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className={styles.actions}
      exit={{ opacity: 0 }}
      style={{
        padding: "padding: 0.5rem 0.8rem",
        zIndex: "100",
        width: "auto",
        boxShadow: "0 0 10px #a9a9a973",
        cursor: "default",
        top: "70px",
        right: "40px",
      }}
    >
      <button
        className={sortby === "new" ? s.active : ""}
        id="new"
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          setToggleSort(false);
          setsortby(e.currentTarget.id);
        }}
      >
        Date added (Newest)
      </button>
      <button
        className={sortby === "old" ? s.active : ""}
        id="old"
        onClick={async (e) => {
          setToggleSort(false);
          setsortby(e.currentTarget.id);
        }}
      >
        Date added (Oldest)
      </button>
    </motion.div>
  );
}
