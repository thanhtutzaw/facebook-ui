import { User } from "firebase/auth";
import {
  Dispatch,
  SetStateAction,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";
import PostProvider from "../../context/PostContext";
import { Post as PostType, likes } from "../../types/interfaces";
import Comment from "../Comment";
import CommentItem from "../Comment/CommentItem";
import Content from "./Content";
import Footer from "./Footer";
import s from "./index.module.scss";
interface PostProps {
  deletePost?: Function;
  shareMode?: boolean;
  auth?: User | null;
  preventNavigate?: boolean;
  selectMode?: boolean;
  post: PostType;
  tabIndex?: number;
  toggleMenu?: string;
  settoggleMenu?: Dispatch<SetStateAction<string>>;
}
function Post({
  deletePost,
  shareMode,
  preventNavigate,
  auth,
  selectMode,
  post,
  tabIndex,
  toggleMenu,
  settoggleMenu,
}: PostProps) {
  const [checked, setChecked] = useState(false);
  const checkRef = useRef<HTMLButtonElement>(null);
  const uncheckRef = useRef<HTMLButtonElement>(null);
  const [client, setclient] = useState(false);
  // const { currentUser } = usePageContext();

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
  const [isDropDownOpenInNestedComment, setisDropDownOpenInNestedComment] =
    useState(false);
  if (!post) return <></>;
  const selectStyle = selectMode ? ` ${s.selected}` : "";
  const shareStyle = shareMode ? ` ${s.share}` : "";
  const checkStyle = checked ? ` ${s.checked}` : "";
  const postClass = `${s.item}${checkStyle}${selectStyle}${shareStyle}`;
  return (
    <PostProvider
      toggleMenu={toggleMenu!}
      settoggleMenu={settoggleMenu!}
      Likes={Likes}
      setLikes={setLikes}
      deletePost={deletePost!}
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
            setlikeCount={setlikeCount}
            post={post}
          />
        )}
        {post && (
          <div className="border-[#e4e4e4] border-t">
            <Comment preview={true} comments={post.latestCommet}>
              {post.latestCommet?.map((comment) => (
                <CommentItem
                  preview={true}
                  key={String(comment.id)}
                  setisDropDownOpenInNestedComment={
                    setisDropDownOpenInNestedComment
                  }
                  isDropDownOpenInNestedComment={isDropDownOpenInNestedComment}
                  post={post}
                  client={client}
                  uid={auth?.uid!}
                  comment={comment}
                  comments={post.latestCommet}
                />
              ))}
            </Comment>
          </div>
        )}
      </div>
    </PostProvider>
  );
}
export default memo(Post);
