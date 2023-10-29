import { AppContext } from "@/context/AppContext";
import { Post, AppProps } from "@/types/interfaces";
import { faGear, faSort } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { RefObject, useContext } from "react";
import { PostList } from "../Home/PostList";
import SortDate from "./SortDate";
import s from "./index.module.scss";
import Spinner from "@/components/Spinner";

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
  const { updatePost, profile } = useContext(AppContext) as AppProps;
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
          // top: selectMode ? infoRef?.current?.clientHeight! : 0,
        }}
        ref={headerRef}
        className={`${s.header}`}
      >
        <h2 className="bold-title">My Posts</h2>

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
      {loading ? (
        tab === "profile" && <Spinner />
      ) : error ? (
        <p className="error">Unexpected Error Occured ! {error.message}</p>
      ) : (
        <>
          <PostList
            profile={profile!}
            updatePost={updatePost}
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
