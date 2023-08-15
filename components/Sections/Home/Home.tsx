import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useRef } from "react";
import { AppContext } from "../../../context/AppContext";
import { PageContext, PageProps } from "../../../context/PageContext";
import styles from "../../../styles/Home.module.scss";
import { Props } from "../../../types/interfaces";
import Newfeed from "./Newfeed";
import Story from "./Story/Story";
// type Props = InferGetServerSidePropsType<typeof getServerSideProps> & {
// };
export default function Home(props: { tabIndex: number }) {
  const { tabIndex } = props;
  const router = useRouter();
  const { profile, postEnd, getMorePosts, active, email, headerContainerRef } =
    useContext(AppContext) as Props;
  const { setuploadButtonClicked } = useContext(PageContext) as PageProps;
  const previousScrollRef = useRef(0);
  return (
    <div
      id="/"
      className={styles.home}
      onScroll={async (e) => {
        const currentScroll = e.currentTarget.scrollTop;
        if (
          window.innerHeight + currentScroll + 1 >=
            e.currentTarget.scrollHeight &&
          !postEnd
        ) {
          getMorePosts?.();
        }
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
          }
        }
      }}
    >
      <Story email={email} />
      <div className={styles.postAction}>
        <Image
          className={styles.profile}
          alt={"profile picture"}
          width={200}
          height={170}
          style={{ width: "40px", height: "40px" }}
          src={
            // "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg""
            (profile?.photoURL as string) ??
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
          }
        />
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
