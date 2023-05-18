import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { Props } from "../../../pages/index";
import { Post as PostType } from "../../../types/interfaces";
import Post from "../../Post/Post";
import s from "./Profile.module.scss";
export default function Profile(props: Props) {
  const { email, myPost } = props;
  // const posts = [
  //   {
  //     id: "hello",
  //     text: "foo barr",
  //   },
  //   {
  //     id: "hello2",
  //     text: "foo barr222",
  //   },
  // ];
  return (
    <div className={s.container}>
      <div className={s.info}>
        <Image
          className={s.profile}
          alt={email || ""}
          width={120}
          height={120}
          src={
            email === "testuser@gmail.com"
              ? "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
              : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
          }
        />
        <h3>{email === "testuser@gmail.com" ? "Peter 1" : email}</h3>
        <p className={s.bio}>Listen I didn't kill Mysterio. The drones did!</p>
      </div>

      <div className={s.myPost}>
        <h2 className={s.header}>
          <p>My Posts</p>
          <button className={s.filterBtn}>
            <FontAwesomeIcon color="#0070f3" icon={faFilter} />
          </button>
        </h2>
        {myPost?.map((post: PostType, index: number) => (
          <Post key={index} post={post} email={null} tabIndex={1} />
        ))}
        <p style={{ textAlign: "center" }}>No more posts</p>
      </div>
    </div>
  );
}
