import { InferGetServerSidePropsType } from "next";
// import { getServerSideProps } from "../../../pages";
import styles from "../../../styles/Home.module.scss";
import { Post as PostType } from "../../../types/interfaces";
import Post from "../../Post";
import { getServerSideProps } from "../../../pages";
// type NewfeedProps = InferGetServerSidePropsType<typeof getServerSideProps> & {
//   canDrag: boolean;
//   tabIndex: number;
// };
type NewfeedProps = InferGetServerSidePropsType<typeof getServerSideProps> & {
  tabIndex: number;
};
export default function Newfeed(props: NewfeedProps) {
  const { tabIndex, posts } = props;
  return (
    <div className={styles.postContainer}>
      {posts?.length !== 0 ? (
        <>
          {posts?.map((post: PostType, index: number) => {
            return <Post tabIndex={tabIndex} key={index} post={post} />;
          })}
          <p style={{ textAlign: "center" }}>No more posts</p>
        </>
      ) : (
        <p style={{ textAlign: "center" }}>Empty Posts !</p>
      )}

      {/* {posts?.map((post: PostType, index: number) => (
        <Post tabIndex={tabIndex} key={index} post={post} email={email} /> )}
      <p style={{ textAlign: "center" }}>No more posts</p> */}

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
