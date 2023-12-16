import { User } from "firebase/auth";
import {
  Dispatch,
  SetStateAction,
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { PageContext, PageProps } from "../../context/PageContext";
import PostProvider from "../../context/PostContext";
import { Post as PostType, likes } from "../../types/interfaces";
import Comment from "../Comment";
import Content from "./Content";
import Footer from "./Footer";
import s from "./index.module.scss";
import CommentItem from "../Comment/CommentItem";
interface PostProps {
  deletePost?: Function;
  shareMode?: boolean;
  auth?: User;
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
  const { currentUser } = useContext(PageContext) as PageProps;
  const [client, setclient] = useState(false);

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
            currentUser={currentUser}
            setlikeCount={setlikeCount}
            post={post}
          />
        )}
        <div className="border-[#e4e4e4] border-t">
          <Comment preview={true} comments={post.latestCommet}>
            {post.latestCommet?.map((comment) => (
              // <>{JSON.stringify(comment.authorId)}</>
              <CommentItem
                key={String(comment.id)}
                // replyInputRef={replyInputRef}
                // replyInput={replyInput}
                // setreplyInput={setreplyInput}
                // setisDropDownOpenInNestedComment={
                //   setisDropDownOpenInNestedComment
                // }
                // isDropDownOpenInNestedComment={isDropDownOpenInNestedComment}
                post={post}
                client={client}
                uid={auth?.uid!}
                comment={comment}
                comments={post.latestCommet}
                // setComments={setlimitedComments}
              />
            ))}
          </Comment>
        </div>
      </div>
    </PostProvider>
  );
}
export default memo(Post);
