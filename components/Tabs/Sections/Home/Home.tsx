import { AppContext } from "@/context/AppContext";
import { PageContext, PageProps } from "@/context/PageContext";
import styles from "@/styles/Home.module.scss";
import { AppProps } from "@/types/interfaces";
import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useRef } from "react";
import Newfeed from "./Newfeed";
import Story from "./Story/Story";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
// type AppProps = InferGetServerSidePropsType<typeof getServerSideProps> & {
// };
export default function Home(props: { tabIndex: number }) {
  const { tabIndex } = props;
  const router = useRouter();
  const { profile, postEnd, getMorePosts, email, headerContainerRef } =
    useContext(AppContext) as AppProps;
  const { setuploadButtonClicked, active } = useContext(
    PageContext
  ) as PageProps;
  const previousScrollRef = useRef(0);
  const { scrollRef } = useInfiniteScroll(postEnd!, false, getMorePosts);
  return (
    <div
      ref={scrollRef}
      id="/"
      className={styles.home}
      onScroll={async (e) => {
        const currentScroll = e.currentTarget.scrollTop;
        const header = headerContainerRef?.current;
        if (!header) return;
        if (active !== "/") return;
        const previousScroll = previousScrollRef.current;
        const scrollingDown = previousScroll < currentScroll;
        if (currentScroll >= 60) {
          previousScrollRef.current = currentScroll;
          if (scrollingDown) {
            header.style.transform = "translateY(-60px)";
            header.style.height = "60px";
          } else if (previousScroll > currentScroll + 25) {
            header.style.transform = "translateY(0px)";
            header.style.height = "120px";
          } else {
            header.style.transform = "translateY(0px)";
            header.style.height = "120px";
          }
        }
      }}
    >
      <Story email={email} />
      <div className={styles.addPost}>
        <div
          style={{
            width: "40px",
            position: "relative",
            height: "40px",
          }}
        >
          <Image
            // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            className={styles.profile}
            alt={`${profile?.firstName ?? "Unknown User"} ${
              profile?.lastName ?? ""
            }'s profile picture`}
            fill
            // width={200}
            // height={170}
            // style={{ width: "40px", height: "40px" }}
            src={
              profile?.photoURL
                ? (profile?.photoURL as string)
                : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
            }
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
          className={styles.addMedia}
        >
          <FontAwesomeIcon color="#0070f3" icon={faPhotoFilm} />
        </button>
      </div>
      <Newfeed tabIndex={tabIndex} />
    </div>
  );
}
