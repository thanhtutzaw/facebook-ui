import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InferGetServerSidePropsType } from "next";
import Image from "next/image";
import styles from "../../../styles/Home.module.scss";
import Newfeed from "./Newfeed";
import Story from "./Story";
import { useRouter } from "next/router";
import { getServerSideProps } from "../../../pages";
// import { getServerSideProps } from "../../../pages/_app";
// export interface Post {
//   text: String;
// }
type Props = InferGetServerSidePropsType<typeof getServerSideProps> & {
  canDrag: boolean;
  tabIndex: number;
};
export function Home(props: Props) {
  const { tabIndex, posts, email, canDrag } = props;
  const router = useRouter();
  return (
    <div id="/" className={styles.home}>
      <Story email={email} />
      <div className={styles.postAction}>
        <Image
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
      <Newfeed
        tabIndex={tabIndex}
        canDrag={canDrag}
        posts={posts}
      />
    </div>
  );
}
