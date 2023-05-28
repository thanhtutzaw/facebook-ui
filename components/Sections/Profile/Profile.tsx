import { faFilter, faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
// import { Props } from "../../../pages/index";
import { AppContext } from "../../../context/AppContext";
import { Post as PostType, Props } from "../../../types/interfaces";
import Post from "../../Post/Post";
import s from "./Profile.module.scss";
import { useActive } from "../../../hooks/useActiveTab";
import { animate, motion } from "framer-motion";
export default function Profile() {
  // const { myPost } = props;
  // const { email } = import { AppContext } from "../../../context/AppContext"; as Props;
  const { myPost, email } = useContext(AppContext) as Props;
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
  const [active, setactive] = useState(false);
  const { active: tab } = useActive();
  const infoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (tab !== "profile") {
      setactive(false);
    }
  }, [tab]);

  return (
    <div
      style={{
        transform: active
          ? `translateY(-${infoRef?.current?.clientHeight}px)`
          : "translateY(0px)",
      }}
      className={s.container}
    >
      <div
        // style={{ transition: "all .3s ease-in-out" }}
        ref={infoRef}
        className={`${s.info} ${active ? s.active : ""}`}
      >
        <Image
          priority={false}
          className={s.profile}
          width={200}
          height={170}
          style={{ objectFit: "cover", width: "120px", height: "120px" }}
          alt={email || "profile"}
          src={
            email === "testuser@gmail.com"
              ? "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
              : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
          }
        />
        <h3>{email === "testuser@gmail.com" ? "Peter 1" : email}</h3>
        <p className={s.bio}>
          Listen I didn&apos;t kill Mysterio. The drones did!
        </p>
      </div>

      <div className={s.myPost}>
        <h2 className={s.header}>
          <p>My Posts</p>
          <button>
            <FontAwesomeIcon color="#0070f3" icon={faFilter} />
          </button>
          <motion.button onClick={() => setactive((prev) => !prev)}>
            <motion.span
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              animate={{ rotate: active ? 480 : 0 }}
              style={{
                willChange: "transform",
                height: "20px",
                width: "20px",
                display: "flex",
              }}
            >
              <FontAwesomeIcon color="#0070f3" icon={faGear} />
            </motion.span>
          </motion.button>
        </h2>
        <div
          style={{
            willChange: "margin",
            marginInline: active ? "1rem" : "initial",
            transition: "all .2s ease-in-out",
          }}
        >
          {myPost?.map((post: PostType) => (
            <Post active={active} key={post.id} post={post} tabIndex={1} />
          ))}
        </div>
        <p style={{ textAlign: "center" }}>No more posts</p>
      </div>
    </div>
  );
}
