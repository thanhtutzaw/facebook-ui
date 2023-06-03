import { motion } from "framer-motion";
import styles from "../../Post/Post.module.scss";
export function SortPostAction(props: { setSort: Function }) {
  const { setSort } = props;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className={styles.actions}
      exit={{ opacity: 0 }}
      style={{ zIndex: "100", width: "auto" }}
    >
      <button
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation(); // router.push({

          setSort(false);
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
        onClick={async (e) => {
          // e.stopPropagation();
          setSort(false);
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
