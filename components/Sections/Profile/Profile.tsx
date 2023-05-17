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
            "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
          }
        />
        {/* <p>User: {email ? email : "Null"}</p> */}
        <p>{email === "testuser@gmail.com" ? "testUser" : email}</p>
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
      </div>
    </div>
  );
}
