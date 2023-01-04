import styles from "../styles/Home.module.css";
import Post from "./Post";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUser } from "../hooks/useUser";
import { json } from "stream/consumers";
import { useState } from "react";
// export async function getServerSideProps() {
//   const { user } = useUser();
//   // let posts = null;
//   const docRef = doc(db, `/users/${user?.uid}/posts/MqmLWlWY9B9XkBYiNkdh`);
//   // const docRef = doc(db, `/users/${user?.uid}/posts/MqmLWlWY9B9XkBYiNkdh`);
//   const docSnap = await getDoc(docRef);
//   // posts = docSnap.data.map((doc) => ({
//   //   id: doc.id,
//   //   ...doc.data(),
//   // }));
//   return {
//     props: {
//       // posts: docSnap.data(),
//       posts: docSnap.data()
//     },
//   };
// }
// async function fetchPosts() {
//   const { user } = useUser();
//   const docRef = doc(db, `/users/${user?.uid}/posts/MqmLWlWY9B9XkBYiNkdh`);

//   // const docRef = doc(db, `/users/${user?.uid}/posts/MqmLWlWY9B9XkBYiNkdh`);
//   const docSnap = await getDoc(docRef);
//   return [docSnap.data()];
// }

export default function Newfeed(props: any) {
  const { posts } = props;
  // const { user } = useUser();
  // console.log(user?.uid);
  // const [post, setpost] = useState([])

  // const {posts} = props;
  // posts?.map(post=>{console.log(post)})

  // const userTest = await fetchUser()
  // console.log(userTest);
  // posts.map(post =>(
  //   <p>{post.text}</p>
  // ))
  // const posts = fetchPosts().then(post => setpost(post))

  // console.log(post)
  // console.log(posts);
  // console.log(posts);
  // const docRef = doc(db, user?.uid, "SF");
  // const docRef = doc(
  //   db,
  //   `/users/${user?.uid}/posts/MqmLWlWY9B9XkBYiNkdh`
  // );
  // const docSnap = getDoc(docRef)
  // console.log(docSnap.data());
  return (
    <div className={styles.postContainer}>
      {/* {JSON.stringify(posts?.text)} */}
      {posts?.map((post: any, index: Number) => (
        // <p>{post.text}</p>
        <Post key={index} id={posts.id} text={post.text} />
      ))}
      <p style={{ textAlign: "center" }}>No more posts</p>
      {/* {post.map(p=>(
        <p>{p?.text}</p>
      ))} */}

      {/* {posts.map(p=>(
        <p>{p.post}</p>
      ))} */}

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
