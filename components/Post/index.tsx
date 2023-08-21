import { User } from "firebase/auth";
import { useContext, useEffect, useRef, useState } from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import { Post as PostType, account, likes } from "../../types/interfaces";
import Content from "./Content";
import { Footer } from "./Footer";
import styles from "./index.module.scss";

interface PostProps {
  updatePost?: Function;
  shareMode?: boolean;
  auth?: User;
  preventNavigate?: boolean;
  selectMode?: boolean;
  post: PostType;
  tabIndex?: number;
  profile?: account["profile"];
}
export default function Post({
  updatePost,
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

  const [client, setclient] = useState(false);
  useEffect(() => {
    setclient(true);
  }, []);
  const [showmore, setShowmore] = useState(false);
  const [likeCount, setlikeCount] = useState(
    parseInt(post?.likeCount?.toString()! ?? "")
  );
  const [Likes, setLikes] = useState<likes | []>([]);
  if (!post) return <></>;
  const postClass = `${styles.item} ${checked ? styles.checked : ""} ${
    selectMode ? styles.selected : ""
  } ${shareMode ? styles.share : ""}`;
  return (
    <div className={postClass}>
      <Content
      Likes={Likes}
      setLikes={setLikes}
        updatePost={updatePost!}
        likeCount={likeCount ?? 0}
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
        tabIndex={tabIndex}
      />
      {!shareMode && (
        <Footer
        setLikes={setLikes}
          profile={profile}
          likeCount={likeCount!}
          setlikeCount={setlikeCount}
          post={post}
          tabIndex={tabIndex}
        />
      )}
    </div>
  );
}
