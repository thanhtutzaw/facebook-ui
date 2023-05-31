import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InferGetServerSidePropsType } from "next";
import Image from "next/image";
import styles from "../../../styles/Home.module.scss";
import Newfeed from "./Newfeed";
import Story from "./Story";
import { useContext } from "react";
import router, { useRouter } from "next/router";
import { getServerSideProps } from "../../../pages";
import { AppContext } from "../../../context/AppContext";
// import { getServerSideProps } from "../../../pages/_app";
// export interface Post {
//   text: String;
// }
type Props = InferGetServerSidePropsType<typeof getServerSideProps> & {
  canDrag: boolean;
  tabIndex: number;
};
export function Home(props: Props) {
  const { tabIndex, canDrag } = props;
  const router = useRouter();
  const { email, headerContainerRef } = useContext(AppContext) as Props;
  return (
    <div
      // style={{ pointerEvents: canDrag ? "none" : "initial" }}
      id="/"
      className={styles.home}
      onScroll={(e) => {
        // console.log();
        const home = document.getElementById("/");

        const header = headerContainerRef?.current;
        if (!header) return;
        if (!home) return;
        // if (e.currentTarget.scrollTop >= 39) {
        // }
        if (e.currentTarget.scrollTop >= 60) {
          // console.log(home);
          // home.style.paddingTop = "55px";

          header.style.transform = "translateY(-60px)";
          header.style.height = "60px";
        } else {
          // home.style.paddingTop = "0px";
          header.style.transform = "translateY(0px)";
          header.style.height = "120px";
        }
      }}
    >
      <Story email={email} />
      <div className={styles.postAction}>
        <Image
          // priority={true}
          className={styles.profile}
          alt={"add post"}
          width={200}
          height={170}
          // style={{ objectFit: "cover" }}
          style={{ width: "40px", height: "40px" }}
          src={
            // "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
            email === "testuser@gmail.com"
              ? "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
              : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
          }
        />
        <input
          readOnly
          onClick={() => {
            router.push("addPost");
            // router.push({pathname:'addPost' , query:uid})
            // the data
            // setAddpostMounted(true)
          }}
          type="text"
          placeholder="What is on your mind ?"
        />
        <button
          onClick={() => {
            router.push("addPost");
          }}
          tabIndex={tabIndex}
          className={styles.addMedia}
        >
          <FontAwesomeIcon color="#0070f3" icon={faPhotoFilm} />
        </button>
      </div>
      <Newfeed tabIndex={tabIndex} />
    </div>
  );
}
