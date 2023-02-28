import { InferGetServerSidePropsType } from "next";
import styles from "../../../styles/Home.module.scss";
import { Post as PostType } from "../../../types/interfaces";
import Post from "../../Post";
import { getServerSideProps } from "../../../pages";
type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
export default function Newfeed(props: Props) {
  const { posts } = props;
  return (
    <div className={styles.postContainer}>
      {posts?.map((post: PostType, index: number) => (
        <Post key={index} post={post} />
      ))}
      <p style={{ textAlign: "center" }}>No more posts</p>

      {/* <Post text="lorem lorem fdsfsdfdf" />
      <Post text="lorem lorem fdsfsdfdf sdfsdfksdfsdjfdsfsdfdksfksdfkdhfds  kfhnds kfdfkdsds jfsfsdjkfsdsdfk dsklfds " />
      <Post text="lorem lorem fdsfsdfdf sdfsdfksdfsdjfdsfsdfdksfksdfkdhfds  kfhnds kfdfkdsds jfsfsdjkfsdsdfk dsklfds dfkjds kjlfsdsdklfsddfjsdfsd fjsd kefsdkl fjdsfljsdkldfjdsfklsdjf klfj fjdskf fdklf dfjsdlkf" />
      <Post text="lorem lorem" />
      <Post text="lorem lorem fdsfsdfdf sdfsdfksdfsdjfdsfsdfdksfksdfkdhfds  kfhnds kfdfkdsds jfsfsdjkfsdsdfk" />
      <Post text="lorem lorem fdsfsdfdf sdfsdfksdfsfds  kfhnd ds kjlfsdsdklfsddfjsdfsd fjsd kefsdkl fjdsfljsdkldfjdsfklsdjf klfj fjdskf fdklf dfjsdlkf" />
      <Post text="lorem lorem   klfj fjdskf fdklf dfjsdlkf" />
      <Post text="lorem lorem fdsfsdfdf s  kfhnds dfkjds kjlfsdsfljsdkldfjdsfklsdjf klfj fjdskf fdklf dfjsdlkf" /> */}
    </div>
  );
}
