import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Post as PostType, Props } from "../../types/interfaces";
import Content from "./Content";
import { Footer } from "./Footer";
import styles from "./index.module.scss";
import { PageContext, PageProps } from "../../context/PageContext";
import { User } from "firebase/auth";

interface PostProps {
  auth?: User;
  preventNavigate?: boolean;
  active?: boolean;
  profile: any;
  post: PostType;
  tabIndex?: number;
}
export default function Post({
  preventNavigate,
  profile,
  auth,
  active,
  post,
  tabIndex,
}: PostProps) {
  const [checked, setChecked] = useState(false);
  const checkRef = useRef<HTMLButtonElement>(null);
  const uncheckRef = useRef<HTMLButtonElement>(null);
  const photoURL = "";
  const { showAction, setshowAction } = useContext(PageContext) as PageProps;

  useEffect(() => {
    if (active) {
      showAction && setshowAction?.("");
    } else {
      checked && setChecked(false);
    }
  }, [active, checked, setshowAction, showAction]);

  // useEffect(() => {
  //   if (tab !== "profile" || "") {
  //     setshowAction?.("");
  //   }
  // }, [setshowAction, tab]);
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
        overflow: active ? "hidden" : "initial",
      }}
    >
      <Content
        preventNavigate={preventNavigate}
        profile={profile!}
        auth={auth!}
        active={active!}
        checked={checked}
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
