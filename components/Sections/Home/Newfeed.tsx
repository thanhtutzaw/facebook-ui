import { InferGetServerSidePropsType } from "next";
import { useContext } from "react";
import { AppContext } from "../../../context/AppContext";
import { getServerSideProps } from "../../../pages";
import styles from "../../../styles/Home.module.scss";
import { Post as PostType, Props } from "../../../types/interfaces";
import Post from "../../Post";
// type NewfeedProps = InferGetServerSidePropsType<typeof getServerSideProps> & {
//   canDrag: boolean;
//   tabIndex: number;
// };
type NewfeedProps = InferGetServerSidePropsType<typeof getServerSideProps> & {
  tabIndex: number;
};
export default function Newfeed(props: NewfeedProps) {
  const { tabIndex } = props;
  const { posts } = useContext(AppContext) as Props;
  // const { id, authorId, text, visibility, createdAt } = posts;

  return (
    <div className={styles.postContainer}>
      {posts?.length !== 0 ? (
        <>
          {posts?.map((post: PostType) => (
            <Post tabIndex={tabIndex} key={post.id} post={post} />
          ))}
          <p>No more posts</p>
        </>
      ) : (
        <p>Empty Posts !</p>
      )}

      {/* {posts?.map((post: PostType, index: number) => (
      <p style={{ textAlign: "center" }}>No more posts</p> */}

      {/* <Post text="lorem lorem fdsfsdfdf" />
      <Post text="lorem lorem fdsfsdfdf sdfsdfksdfsdjfdsfsdfdksfksdfkdhfds  kfhnds kfdfkdsds jfsfsdjkfsdsdfk dsklfds " />
      <Post text="lorem lorem fdsfsdfdf sdfsdfksdfsdjfdsfsdfdksfksdfkdhfds  kfhnds kfdfkdsds jfsfsdjkfsdsdfk dsklfds dfkjds kjlfsdsdklfsddfjsdfsd fjsd kefsdkl fjdsfljsdkldfjdsfklsdjf klfj fjdskf fdklf dfjsdlkf" />
      <Post text="lorem lorem fdsfsdfdf sdfsdfksdfsdjfdsfsdfdksfksdfkdhfds  kfhnds kfdfkdsds jfsfsdjkfsdsdfk" />
      <Post text="lorem lorem fdsfsdfdf sdfsdfksdfsfds  kfhnd ds kjlfsdsdklfsddfjsdfsd fjsd kefsdkl fjdsfljsdkldfjdsfklsdjf klfj fjdskf fdklf dfjsdlkf" />
      <Post text="lorem lorem   klfj fjdskf fdklf dfjsdlkf" />
      <Post text="lorem lorem fdsfsdfdf s  kfhnds dfkjds kjlfsdsfljsdkldfjdsfklsdjf klfj fjdskf fdklf dfjsdlkf" /> */}
    </div>
  );
}
