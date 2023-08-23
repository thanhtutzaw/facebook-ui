import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Post, likes } from "../../types/interfaces";
import { LikedUsers } from "./LikedUsers";
import s from "./index.module.scss";
import { fetchLikedUsers } from "../../lib/firestore/post";
export function SocialCount(props: {
  post: Post;
  likeCount: number;
  Likes: likes;
  setLikes: Function;
}) {
  const { post, likeCount, Likes, setLikes } = props;
  // const [reaction, setReaction] = useState({
  //   like: ["1a", "2d"],
  // });
  const shareCount = post.shares?.length ?? 0;
  const commentCount = parseInt(
    (post.commentCount?.toString() as string) ?? 0
  ) as number;

  const SocialDialog = useRef<HTMLDialogElement>(null);
  const [togglereactionList, settogglereactionList] = useState(false);
  useEffect(() => {
    togglereactionList
      ? SocialDialog.current?.showModal()
      : setTimeout(() => {
          SocialDialog.current?.close();
        }, 200);
  }, [togglereactionList]);

  useEffect(() => {}, [likeCount]);

  const [loading, setloading] = useState(false);
  if (shareCount > 0 || likeCount > 0 || commentCount > 0)
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
                  setloading(true);
                  setLikes(await fetchLikedUsers(post));
                  setloading(false);
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
            {post.shares && shareCount !== 0 && (
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
            className={s.reactionDialog}
            ref={SocialDialog}
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
              <motion.div
                // exit={{ opacity: 0, y: 300 }}
                // initial={{ opacity: 0, y: 300 }}
                animate={
                  {
                    // y: !togglereactionList ? 300 : 0,
                  }
                }
                className={s.reactionContainer}
              >
                <LikedUsers
                  count={likeCount}
                  settogglereactionList={settogglereactionList}
                  loading={loading}
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
  else return <></>;
}
