import {
  faCircleCheck,
  faComment,
  faDotCircle,
  faEllipsisH,
  faShare,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Timestamp } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import router, { useRouter } from "next/router";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AppContext } from "../../context/AppContext";
import { Post as PostType, Props } from "../../types/interfaces";
import Actions from "./Actions";
import styles from "./Post.module.scss";
import Link from "next/link";
import Content from "./Content";
// type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
// interface Props {
//   post: Post;
// }
interface PostProps {
  active?: boolean;
  post: PostType;
  tabIndex: number;
}
export default function Post({ active, post, tabIndex }: PostProps) {
  const { authorId, id } = post;
  const [Bounce, setBounce] = useState(false);

  // const date = createdAt ? createdAt?.toDate().toLocaleDateString() : 0;
  const [checked, setChecked] = useState(false);
  const checkRef = useRef<HTMLButtonElement>(null);
  const uncheckRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const photoURL = "";
  const {
    active: tab,
    showAction,
    setshowAction,
  } = useContext(AppContext) as Props;

  useEffect(() => {
    if (active) {
      showAction && setshowAction?.("");
    } else {
      checked && setChecked(false);
    }
  }, [active, checked, setshowAction, showAction]);

  // const dateString = useRef("");
  // const timeString = new Timestamp(createdAt.seconds, createdAt.nanoseconds)
  //   .toDate()
  //   .toLocaleDateString();
  // useLayoutEffect(() => {
  //   const date = new Timestamp(createdAt.seconds, createdAt.nanoseconds);
  //   dateString.current = date.toDate().toLocaleDateString();
  // }, [createdAt.nanoseconds, createdAt.seconds]);

  useEffect(() => {
    if (tab !== "profile" || "") {
      setshowAction?.("");
    }
    // if (tab !== "") {
    //   setshowAction?.("");
    // }
  }, [setshowAction, tab]);
  // var patt2 = new RegExp("<div>", "g");
  // var patt3 = new RegExp("</div>", "g");
  // var patt4 = new RegExp("<br>", "g");
  // const replace = text.replace("<div>", "").replaceAll("</div><div>", "<br>");
  const [client, setclient] = useState(false);
  useEffect(() => {
    setclient(true);
  }, []);
  const [showmore, setShowmore] = useState(false);
  return (
    <div
      className={styles.post}
      style={{
        transition: "all .1s ease-in-out",
        borderRadius: checked ? "50px" : "0",
        border: checked ? "10px solid #0070f312" : "0px solid #0070f312",
        // backgroundColor: checked ? "rgb(223 255 220)" : "",
        userSelect: active ? "none" : "initial",
        cursor: active ? "pointer" : "initial",
      }}
    >
      {!active ? (
        <Link href={!active ? `${authorId}/${id?.toString()}` : router.asPath}>
          <Content
            active={active!}
            checked={checked}
            photoURL={photoURL}
            client={client}
            uncheckRef={uncheckRef}
            setChecked={setChecked}
            checkRef={checkRef}
            showmore={showmore}
            setShowmore={setShowmore}
            post={post}
          />
        </Link>
      ) : (
        <Content
          active={active!}
          checked={checked}
          photoURL={photoURL}
          client={client}
          uncheckRef={uncheckRef}
          setChecked={setChecked}
          checkRef={checkRef}
          showmore={showmore}
          setShowmore={setShowmore}
          post={post}
        />
      )}

      <div className={styles.action}>
        <button tabIndex={tabIndex}>
          <FontAwesomeIcon bounce={Bounce} icon={faThumbsUp} />
          <p>Like</p>
        </button>
        <button tabIndex={tabIndex}>
          <FontAwesomeIcon icon={faComment} bounce={Bounce} />

          <p>Comment</p>
        </button>
        <button tabIndex={tabIndex}>
          <FontAwesomeIcon icon={faShare} bounce={Bounce} />
          <p>Share</p>
        </button>
      </div>
    </div>
  );
}
