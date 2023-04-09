import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InferGetServerSidePropsType } from "next";
import Image from "next/image";
import { getServerSideProps } from "../../../pages";
import styles from "../../../styles/Home.module.scss";
import Newfeed from "./Newfeed";
import Story from "./Story";
import { useRouter } from "next/router";
import { setTimeout } from "timers";
// export interface Post {
//   text: String;
// }
type Props = InferGetServerSidePropsType<typeof getServerSideProps> & {
  canDrag: boolean;
};
export function Home(props: Props) {
  const { posts, email, canDrag } = props;
  // useEffect(() => {
  //   console.log("Home is Rendering");
  // }, []);
  const router = useRouter();
  return (
    <div id="/" className={styles.home}>
      <Story />
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
          onFocus={() => {
            router.push("addPost");
          }}
          type="text"
          placeholder="What is on your mind ?"
        />
        <button className={styles.addMedia}>
          <FontAwesomeIcon color="#0070f3" icon={faPhotoFilm} />
        </button>
      </div>
      <Newfeed canDrag={canDrag} email={email} posts={posts} />
    </div>
  );
}
