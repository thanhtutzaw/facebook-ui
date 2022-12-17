import styles from "../styles/Home.module.css";
import Post from "./Post";

export function Newfeed() {
  return (
    <div className={styles.postContainer}>  
      <Post text="lorem lorem fdsfsdfdf"/>
      <Post text="lorem lorem fdsfsdfdf sdfsdfksdfsdjfdsfsdfdksfksdfkdhfds  kfhnds kfdfkdsds jfsfsdjkfsdsdfk dsklfds "/>
      <Post text="lorem lorem fdsfsdfdf sdfsdfksdfsdjfdsfsdfdksfksdfkdhfds  kfhnds kfdfkdsds jfsfsdjkfsdsdfk dsklfds dfkjds kjlfsdsdklfsddfjsdfsd fjsd kefsdkl fjdsfljsdkldfjdsfklsdjf klfj fjdskf fdklf dfjsdlkf"/>
      <Post text="lorem lorem"/>
      <Post text="lorem lorem fdsfsdfdf sdfsdfksdfsdjfdsfsdfdksfksdfkdhfds  kfhnds kfdfkdsds jfsfsdjkfsdsdfk"/>
      <Post text="lorem lorem fdsfsdfdf sdfsdfksdfsfds  kfhnd ds kjlfsdsdklfsddfjsdfsd fjsd kefsdkl fjdsfljsdkldfjdsfklsdjf klfj fjdskf fdklf dfjsdlkf"/>
      <Post text="lorem lorem   klfj fjdskf fdklf dfjsdlkf"/>
      <Post text="lorem lorem fdsfsdfdf s  kfhnds dfkjds kjlfsdsfljsdkldfjdsfklsdjf klfj fjdskf fdklf dfjsdlkf"/>
    </div>
  );
}
