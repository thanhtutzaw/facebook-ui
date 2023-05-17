import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InferGetServerSidePropsType } from "next";
import Image from "next/image";
import { getServerSideProps } from "../../../pages";
import styles from "../../../styles/Home.module.scss";
import Newfeed from "./Newfeed";
import Story from "./Story";
import { useRouter } from "next/router";
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
          width={50}
          height={50}
          src={
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
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
        email={email}
        posts={posts}
      />
    </div>
  );
}
