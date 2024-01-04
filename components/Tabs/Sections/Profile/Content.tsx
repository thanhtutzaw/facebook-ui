import Spinner from "@/components/Spinner";
import { useAppContext } from "@/context/AppContext";
import { Post } from "@/types/interfaces";
import { faGear, faSort } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { MutableRefObject, RefObject, useState } from "react";
import PostList from "../Home/PostList";
import SortDate from "./SortDate";
import s from "./index.module.scss";
import { useNewsFeedContext } from "@/context/NewsFeedContext";

export function Content(props: {
  hasNextPage?: boolean;
  error?: any;
  infoRef: RefObject<HTMLHeadElement>;
  headerRef: RefObject<HTMLHeadElement>;
  isSticky: MutableRefObject<boolean>;
  tab: string;
  loading: boolean;
  setselectMode: Function;
  sortby: "new" | "old";
  setsortby: Function;
  sortedPost: Post[];
}) {
  const {
    hasNextPage,
    tab,
    error,
    isSticky,
    headerRef,
    loading,
    setselectMode,
    sortby,
    setsortby,
    sortedPost,
  } = props;
  const {  selectMode } = useAppContext();
  const { deletePost } = useNewsFeedContext();
  const [toggleSort, setToggleSort] = useState(false);
  return (
    <div
      style={{
        position: "relative",
      }}
      className={s.myPost}
    >
      <header
        style={{
          borderBottom: isSticky ? "1px solid #f1f1f1" : "initial",
          zIndex: "50",
        }}
        ref={headerRef}
      >
        <h2 className="bold-title">My Posts</h2>

        <button
          aria-expanded={toggleSort}
          onClick={() => {
            setToggleSort((prev) => !prev);
          }}
          aria-label="sort dropdown toggle"
        >
          <div>
            <FontAwesomeIcon color="#0070f3" icon={faSort} />
          </div>
        </button>
        <button
          aria-label="toggle select mode"
          aria-expanded={selectMode}
          onClick={(e) => {
            setselectMode?.((prev: boolean) => !prev);
            setToggleSort(false);

            // if (!selectMode) {
            //   const parent =
            //     e.currentTarget.parentElement?.parentElement?.parentElement;
            //   // parent?.scrollIntoView({
            //   // });
            // }
          }}
        >
          <div>
            <motion.span
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 100,
              }}
              animate={{
                rotate: selectMode ? 480 : 0,
              }}
              style={{
                willChange: "transform",
                height: "20px",
                width: "20px",
                display: "flex",
              }}
            >
              <FontAwesomeIcon color="#0070f3" icon={faGear} />
            </motion.span>
          </div>
        </button>
        <AnimatePresence>
          {toggleSort && (
            <SortDate
              toggleSort={toggleSort}
              sortby={sortby}
              setsortby={setsortby}
              setToggleSort={setToggleSort}
            />
          )}
        </AnimatePresence>
      </header>
      {loading ? (
        tab === "profile" && <Spinner />
      ) : error ? (
        <p className="error">Unexpected Error Occured ! {error.message}</p>
      ) : (
        <>
          <PostList
            deletePost={deletePost}
            preventNavigate={true}
            selectMode={selectMode!}
            posts={sortedPost!}
            tabIndex={1}
            postLoading={hasNextPage}
          />
        </>
      )}
    </div>
  );
}
