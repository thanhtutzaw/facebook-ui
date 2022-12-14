import styles from "../styles/Home.module.css";
import Post from "./Post";

export default function Newfeed(props: any) {
  const { posts } = props;
  return (
    <div className={styles.postContainer}>
      {posts?.map((post: any, index: Number) => (
        <Post key={index} id={posts.id} text={post.text} />
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
