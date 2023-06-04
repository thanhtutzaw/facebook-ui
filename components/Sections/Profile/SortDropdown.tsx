import { motion } from "framer-motion";
import styles from "../../Post/Post.module.scss";
import s from "./Profile.module.scss";
import useEscape from "../../../hooks/useEscape";
export function SortDropdown(props: {
  sort: boolean;
  sortby: string;
  setSort: Function;
  setsortby: Function;
}) {
  const { sort, sortby, setSort, setsortby } = props;
  useEscape(() => {
    if (sort) setSort(false);
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
          e.stopPropagation(); // router.push({
          setSort(false);
          setsortby(e.currentTarget.id);
          //   pathname: `${authorId}/${id?.toString()}`,
          //   query: { edit: true },
          // });
          // if (auth.currentUser?.uid !== authorId) {
          //   alert("Not Allowed ! Mismatch userId and authorId");
          //   throw new Error("Not Allowed");
          // }
          // try {
          //   await deletePost(auth.currentUser?.uid!, id?.toString()!);
          //   router.replace("/", undefined, {
          //     scroll: false,
          //   });
          // } catch (error: any) {
          //   alert(error.message);
          // } finally {
          //   setshowAction?.("");
          // }
        }}
      >
        Date added (Newest)
      </button>
      <button
        className={sortby === "old" ? s.active : ""}
        id="old"
        onClick={async (e) => {
          setSort(false);
          setsortby(e.currentTarget.id);
          // if (auth.currentUser?.uid !== authorId) {
          //   alert("Not Allowed ! Mismatch userId and authorId");
          //   throw new Error("Not Allowed");
          // }
          // try {
          //   await deletePost(auth.currentUser?.uid!, id!);
          //   router.replace("/", undefined, {
          //     scroll: false,
          //   });
          // } catch (error: any) {
          //   alert(error.message);
          // } finally {
          //   router.replace("/", undefined, {
          //     scroll: false,
          //   });
          //   setshowAction?.("");
          // }
        }}
      >
        {/* <FontAwesomeIcon icon={faTrash} /> */}
        Date added (Oldest)
      </button>
    </motion.div>
  );
}
