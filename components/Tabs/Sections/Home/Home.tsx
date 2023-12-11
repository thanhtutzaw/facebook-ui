import { AppContext } from "@/context/AppContext";
import { PageContext, PageProps } from "@/context/PageContext";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { checkPhotoURL } from "@/lib/firestore/profile";
import styles from "@/styles/Home.module.scss";
import { AppProps } from "@/types/interfaces";
import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useRef } from "react";
import Newfeed from "./Newfeed";
import Story from "./Story/Story";
// type AppProps = InferGetServerSidePropsType<typeof getServerSideProps> & {
// };
export default function Home(props: { tabIndex: number }) {
  const { ...rest} = props;
  const router = useRouter();
  const {
    profileSrc,
    profile,
    postEnd,
    getMorePosts,
    headerContainerRef,
    hasMore,
  } = useContext(AppContext) as AppProps;
  const { setuploadButtonClicked, active } = useContext(
    PageContext
  ) as PageProps;
  const previousScrollRef = useRef(0);
  const { scrollRef } = useInfiniteScroll({
    hasMore: hasMore!,
    scrollParent: false,
    fetchMoreData: getMorePosts,
    postEnd: postEnd!,
  });
  return (
    <div
      aria-hidden={rest.tabIndex === -1}
      ref={scrollRef}
      id="/"
      {...rest}
      className={styles.home}
      onScroll={async (e) => {
        console.log("scrolled");
        const currentScroll = e.currentTarget.scrollTop;
        const headerContainer = headerContainerRef?.current;
        if (!headerContainer) return;
        if (active !== "/") return;
        const previousScroll = previousScrollRef.current;
        const scrollingDown = previousScroll < currentScroll;
        if (currentScroll >= 60) {
          const hideHeader = () => {
            headerContainer.setAttribute("data-hide", "true");
            // headerContainer.style.transform = "translateY(-60px)";
            // headerContainer.style.height = "60px";
          };
          const showHeader = () => {
            headerContainer.setAttribute("data-hide", "false");
            // headerContainer.style.transform = "translateY(0px)";
            // headerContainer.style.height = "120px";
          };
          previousScrollRef.current = currentScroll;
          if (scrollingDown) {
            hideHeader();
          } else if (previousScroll > currentScroll + 25) {
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
            router.push("addPost");
          }}
          type="text"
          placeholder="What is on your mind ?"
        />
        <button
          aria-label="upload media"
          title="Upload media"
          onClick={() => {
            router.push("addPost");
            setuploadButtonClicked?.(true);
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
