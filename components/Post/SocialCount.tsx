import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { fetchLikedUsers } from "../../lib/firestore/post";
import { LikedUsers } from "./LikedUsers";
import { PostContext, PostProps } from "./PostContext";
import s from "./index.module.scss";
export function SocialCount(props: { post: any; Likes: any; setLikes: any; likeCount: any; }) {
  const { post, Likes, setLikes, likeCount } = props;
  // const {} = useContext(PostContext) as PostProps;
  // const [reaction, setReaction] = useState({
  //   like: ["1a", "2d"],
  // });
  const shareCount = parseInt((post.shareCount?.toString() as string) ?? 0);
  const commentCount = parseInt((post.commentCount?.toString() as string) ?? 0);
  const SocialUserDialogRef = useRef<HTMLDialogElement>(null);
  const [togglereactionList, settogglereactionList] = useState(false);

  useEffect(() => {
    togglereactionList
      ? SocialUserDialogRef.current?.showModal()
      : setTimeout(() => {
          SocialUserDialogRef.current?.close();
        }, 200);
  }, [togglereactionList]);

  useEffect(() => {}, [likeCount]);
  const [socialUserListLoading, setSocialUserListLoading] = useState(false);
  const countExist = shareCount > 0 || likeCount > 0 || commentCount > 0;
  if (!countExist) return <></>;
  return (
    <>
      {shareCount || likeCount || commentCount ? (
        <div className={s.socialCount}>
          {likeCount > 0 && likeCount && typeof likeCount !== "string" && (
            <p
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                settogglereactionList?.(true);
                if (Likes?.length ?? 0 > 0) return;
                setSocialUserListLoading(true);
                setLikes(await fetchLikedUsers(post));
                setSocialUserListLoading(false);
              }}
            >
              {likeCount} {likeCount <= 1 ? "like" : "likes"}
            </p>
          )}
          {!commentCount || (
            <p>
              {commentCount} {commentCount <= 1 ? "comment" : "comments"}
            </p>
          )}
          {shareCount !== 0 && (
            <p
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {shareCount} {shareCount <= 1 ? "share" : "shares"}
            </p>
          )}
        </div>
      ) : null}
      <AnimatePresence
        onExitComplete={() => {
          console.log("animation exited");
        }}
      >
        <motion.dialog
          key={post.id}
          // exit={{ y: 800 }}
          exit={{ opacity: 0 }}
          // initial={{ opacity: 1, y: 800 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          animate={{
            opacity: togglereactionList ? 1 : 0,
            // y: !togglereactionList ? 800 : 0,
          }}
          className={s.SocialUserDialog}
          ref={SocialUserDialogRef}
          onClose={(e) => {
            settogglereactionList?.(false);

            e.currentTarget.style.opacity = "0";
            // e.currentTarget.style.transform = "translateY(400px)";
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div className={s.reactionContainer}>
              <LikedUsers
                count={likeCount}
                settogglereactionList={settogglereactionList}
                loading={socialUserListLoading}
                key={post.id}
                post={post!}
                setLikes={setLikes!}
                Likes={Likes!}
                togglereactionList={togglereactionList}
              />
            </motion.div>
          </AnimatePresence>
        </motion.dialog>
      </AnimatePresence>
    </>
  );
}
