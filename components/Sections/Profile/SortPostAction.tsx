import { motion } from "framer-motion";
import styles from "../../Post/Post.module.scss";
export function SortPostAction(props: {
  sortby: string;
  setSort: Function;
  setsortby: Function;
}) {
  const { sortby, setSort, setsortby } = props;

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
      }}
    >
      <button
        className={sortby === "new" ? "active" : ""}
        id="new"
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation(); // router.push({

          if (sortby === e.currentTarget.id) {
            e.currentTarget.style.border = "2px solid red";
          }
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
        className={sortby === "old" ? "active" : ""}
        id="old"
        onClick={async (e) => {
          // e.stopPropagation();
          setSort(false);
          setsortby(e.currentTarget.id);
          if (sortby === e.currentTarget.id) {
            e.currentTarget.style.border = "2px solid red";
          }
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
