import { useAppContext } from "@/context/AppContext";
import { useNewsFeedContext } from "@/context/NewsFeedContext";
import { usePageContext } from "@/context/PageContext";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { checkPhotoURL } from "@/lib/firestore/profile";
import styles from "@/styles/Home.module.scss";
import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useRouter } from "next/router";
import { useRef } from "react";
import Newfeed from "./Newfeed";
import Story from "./Story/Story";
// type  = InferGetServerSidePropsType<typeof getServerSideProps> & {
// };
export default function Home(props: { tabIndex: number }) {
  const { ...rest } = props;
  const { deletePost, newsFeedPost, getMorePosts } = useNewsFeedContext();
  const router = useRouter();
  const { profileSrc, profile, headerContainerRef } = useAppContext();
  const { postEnd, hasMore } = useNewsFeedContext();
  const { setuploadButtonClicked } = usePageContext();
  const previousScrollRef = useRef(0);
  const { scrollRef } = useInfiniteScroll({
    hasMore: hasMore!,
    scrollParent: false,
    fetchMoreData: getMorePosts,
    postEnd: postEnd!,
  });
  const headerContainer = headerContainerRef && headerContainerRef?.current;
  const hideHeader = () => {
    if (!headerContainer) return;
    headerContainer.setAttribute("data-hide", "true");
  };
  const showHeader = () => {
    if (!headerContainer) return;
    headerContainer.setAttribute("data-hide", "false");
  };
  return (
    <div
      aria-hidden={rest.tabIndex === -1}
      ref={scrollRef}
      id="/"
      // key={expired ? "true" : "false"}
      {...rest}
      className={styles.home}
      onScroll={async (e) => {
        const currentScroll = e.currentTarget.scrollTop;
        if (!headerContainer) return;
        const isScrolling = previousScrollRef.current < currentScroll;
        if (currentScroll >= 60) {
          previousScrollRef.current = currentScroll;
          if (isScrolling) {
            hideHeader();
          } else if (previousScrollRef.current > currentScroll + 25) {
            showHeader();
          } else {
            showHeader();
          }
        }
      }}
    >
      <Story />
      <div className={styles.addPost}>
        <div
          style={{
            width: "40px",
            position: "relative",
            height: "40px",
          }}
        >
          <Image
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            className={styles.profile}
            alt={`${profile?.firstName ?? "Unknown User"} ${
              profile?.lastName ?? ""
            }'s profile picture`}
            fill
            // width={200}
            // height={170}
            // style={{ width: "40px", height: "40px" }}
            src={checkPhotoURL(profileSrc ?? profile?.photoURL)}
          />
        </div>
        <input
          tabIndex={-1}
          aria-label="Go to Add Post page"
          readOnly
          onFocus={(e) => {
            e.target.addEventListener("keydown", (event: KeyboardEvent) => {
              if (event.key === "Enter") {
                e.target?.click();
              }
            });
          }}
          onClick={() => {
            router.push({ hash:"addPost" },"addPost", { shallow: true });
          }}
          type="text"
          placeholder="What is on your mind ?"
        />
        <button
          aria-label="upload media"
          title="Upload media"
          onClick={() => {
            router.push("addPost");
            setuploadButtonClicked(true);
          }}
          tabIndex={-1}
          className={`rounded-full
    border-0
    bg-transparent
    p-2
    h-9
    w-9
    items-center
    justify-center flex ${styles.addMedia}`}
        >
          <FontAwesomeIcon color="#0070f3" icon={faPhotoFilm} />
        </button>
      </div>
      <Newfeed tabIndex={rest.tabIndex} />
    </div>
  );
}
