import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Post, likes } from "../../types/interfaces";
import { LikedUsers } from "./LikedUsers";
import s from "./index.module.scss";
export function SocialCount(props: { post: Post; likeCount: number }) {
  const { post, likeCount } = props;
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
    console.log(SocialDialog.current?.open);
    togglereactionList
      ? SocialDialog.current?.showModal()
      : setTimeout(() => {
          SocialDialog.current?.close();
        }, 1000);
  }, [togglereactionList]);
  const [Likes, setLikes] = useState<likes | []>([]);

  return (
    <>
      {/* {JSON.stringify(Likes)} */}

      {shareCount || likeCount || commentCount ? (
        <div className={s.socialCount}>
          {likeCount > 0 && likeCount && typeof likeCount !== "string" && (
            <p
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                settogglereactionList?.(true);
                // SocialDialog.current?.showModal();
                // if (SocialDialog.current?.open) return;
                // SocialDialog.current?.showModal();
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
        {/* {togglereactionList && ( */}
        <motion.dialog
          key={post.id}
          // open={togglereactionList}
          exit={{ y: 300 }}
          initial={{ opacity: 1, y: 300 }}
          transition={{ duration: 0.5 }}
          animate={{
            // opacity: togglereactionList ? 1 : 0,
            y: !togglereactionList ? 300 : 0,
          }}
          className={s.reactionDialog}
          ref={SocialDialog}
          onClose={(e) => {
            settogglereactionList?.(false);

            // e.currentTarget.style.opacity = "0";
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
            {togglereactionList && (
              <motion.div
                // exit={{ opacity: 0, y: 300 }}
                // initial={{ opacity: 0, y: 300 }}
                // transition={{ duration: 0.2 }}
                animate={
                  {
                    // opacity: togglereactionList ? 1 : 0,
                    // y: !togglereactionList ? 300 : 0,
                  }
                }
                className={s.reactionContainer}
              >
                <LikedUsers
                  settogglereactionList={settogglereactionList}
                  likeCount={likeCount}
                  key={post.id}
                  post={post}
                  Likes={Likes}
                  setLikes={setLikes}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.dialog>
      </AnimatePresence>
    </>
  );
}
