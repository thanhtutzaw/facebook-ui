import { User } from "firebase/auth";
import {
  CSSProperties,
  HTMLAttributes,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import { Post as PostType } from "../../types/interfaces";
import Content from "./Content";
import { Footer } from "./Footer";
import styles from "./index.module.scss";

interface PostProps {
  shareMode?: boolean;
  auth?: User;
  preventNavigate?: boolean;
  selectMode?: boolean;
  post: PostType;
  tabIndex?: number;
  profile?: any;
}
export default function Post({
  shareMode,
  preventNavigate,
  auth,
  selectMode,
  post,
  tabIndex,
  profile,
}: PostProps) {
  const [checked, setChecked] = useState(false);
  const checkRef = useRef<HTMLButtonElement>(null);
  const uncheckRef = useRef<HTMLButtonElement>(null);
  const { showAction, setshowAction } = useContext(PageContext) as PageProps;

  useEffect(() => {
    if (selectMode) {
      showAction && setshowAction?.("");
    } else {
      checked && setChecked(false);
    }
  }, [selectMode, checked, setshowAction, showAction]);

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
      className={`${styles.post}`}
      style={{
        transition: "all 0.3s ease-in-out",
        borderRadius: checked ? "50px" : "0",
        border: checked ? "10px solid #0070f312" : "0px solid #0070f312",
        userSelect: selectMode ? "none" : "initial",
        cursor: selectMode || shareMode ? "pointer" : "initial",
        overflow: selectMode ? "hidden" : "initial",

        outline: shareMode ? "1px solid #e3e3e3" : "initial",
        pointerEvents: shareMode ? "none" : "initial",
        // scale: shareMode ? ".9" : "initial",
        // margin: shareMode ? "0 auto" : "initial",
      }}
    >
      <Content
        preventNavigate={preventNavigate}
        auth={auth!}
        selectMode={selectMode!}
        checked={checked}
        client={client}
        uncheckRef={uncheckRef}
        setChecked={setChecked}
        checkRef={checkRef}
        showmore={showmore}
        setShowmore={setShowmore}
        post={post}
        shareMode={shareMode}
      />

      {!shareMode && <Footer post={post} tabIndex={tabIndex} />}
    </div>
  );
}
