import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Post as PostType, Props } from "../../types/interfaces";
import Content from "./Content";
import { Footer } from "./Footer";
import styles from "./Post.module.scss";
// type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

interface PostProps {
  active?: boolean;
  post: PostType;
  tabIndex: number;
}
export default function Post({ active, post, tabIndex }: PostProps) {
  const [checked, setChecked] = useState(false);
  const checkRef = useRef<HTMLButtonElement>(null);
  const uncheckRef = useRef<HTMLButtonElement>(null);
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
        transition: "all 0.3s ease-in-out",
        borderRadius: checked ? "50px" : "0",
        border: checked ? "10px solid #0070f312" : "0px solid #0070f312",
        userSelect: active ? "none" : "initial",
        cursor: active ? "pointer" : "initial",
      }}
    >
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

      <Footer tabIndex={tabIndex} />
    </div>
  );
}
