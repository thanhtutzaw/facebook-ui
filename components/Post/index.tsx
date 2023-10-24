import { User } from "firebase/auth";
import { useContext, useEffect, useRef, useState } from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import PostProvider from "../../context/PostContext";
import { Post as PostType, account, likes } from "../../types/interfaces";
import Content from "./Content";
import { Footer } from "./Footer";
import s from "./index.module.scss";

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
}: PostProps) {
  const [checked, setChecked] = useState(false);
  const checkRef = useRef<HTMLButtonElement>(null);
  const uncheckRef = useRef<HTMLButtonElement>(null);
  const { currentUser } = useContext(PageContext) as PageProps;
  const [client, setclient] = useState(false);

  const [toggleMenu, settoggleMenu] = useState("");
  useEffect(() => {
    if (selectMode) {
      toggleMenu && settoggleMenu?.("");
    } else {
      checked && setChecked(false);
    }
  }, [selectMode, checked, settoggleMenu, toggleMenu]);

  useEffect(() => {
    setclient(true);
  }, []);
  const [showmore, setShowmore] = useState(false);
  const [likeCount, setlikeCount] = useState(
    parseInt(post?.likeCount?.toString()! ?? "")
  );
  const [Likes, setLikes] = useState<likes | []>([]);
  if (!post) return <></>;
  const selectStyle = selectMode ? ` ${s.selected}` : "";
  const shareStyle = shareMode ? ` ${s.share}` : "";
  const checkStyle = checked ? ` ${s.checked}` : "";
  const postClass = `${s.item}${checkStyle}${selectStyle}${shareStyle}`;
  return (
    <PostProvider
      toggleMenu={toggleMenu}
      settoggleMenu={settoggleMenu}
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
    >
      <div className={postClass}>
        <Content post={post} />
        {!shareMode && (
          <Footer
            setLikes={setLikes}
            likeCount={likeCount}
            currentUser={currentUser}
            setlikeCount={setlikeCount}
            post={post}
          />
        )}
      </div>
    </PostProvider>
  );
}
