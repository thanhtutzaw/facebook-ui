import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import s from "./index.module.scss";
import SortDate from "./SortDate";
import { PostList } from "../Home/PostList";
import { faSort, faGear } from "@fortawesome/free-solid-svg-icons";
import { Post } from "../../../types/interfaces";
import { RefObject } from "react";
import Spinner from "../../Spinner";

export default function Content(props: {
  hasNextPage?: boolean;
  error?: any;
  infoRef: RefObject<HTMLHeadElement>;
  headerRef: RefObject<HTMLHeadElement>;
  isSticky: boolean;
  tab: string;
  loading: boolean;
  sort: boolean;
  setSort: Function;
  selectMode: boolean;
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
    sort,
    setSort,
    selectMode,
    setselectMode,
    sortby,
    setsortby,
    sortedPost,
  } = props;
  return (
    <div
      style={{
        position: "relative",
      }}
      className={s.myPost}
    >
      {/* {JSON.stringify(sortedPost)} */}
      <header
        style={{
          borderBottom: isSticky ? "1px solid #f1f1f1" : "initial",
          // top: selectMode ? infoRef?.current?.clientHeight! : 0,
        }}
        ref={headerRef}
        className={s.header}
      >
        <h2>My Posts</h2>

        <button
          aria-expanded={sort}
          onClick={() => {
            setSort((prev: any) => !prev);
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
            setselectMode?.((prev: any) => !prev);
            setSort(false);

            if (!selectMode) {
              const parent =
                e.currentTarget.parentElement?.parentElement?.parentElement;
              // parent?.scrollIntoView({
              //   behavior: "smooth",
              // });
            }
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
          {sort && (
            <SortDate
              sort={sort}
              sortby={sortby}
              setsortby={setsortby}
              setSort={setSort}
            />
          )}
        </AnimatePresence>
      </header>

      {/* {tab === "profile" && <Spinner />} */}
      {loading ? (
        tab === "profile" && <Spinner />
      ) : error ? (
        <p style={{ textAlign: "center" }}>
          Unexpected Error Occured ! {error.message}
        </p>
      ) : (
        <>
          <PostList
            preventNavigate={true}
            selectMode={selectMode!}
            posts={sortedPost!}
            tabIndex={1}
          />
          {hasNextPage && <Spinner />}
        </>
      )}
    </div>
  );
}
