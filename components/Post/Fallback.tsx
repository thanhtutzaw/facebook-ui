import { deletePost } from "@/lib/firestore/post";
import Spinner from "../Spinner";
import { useState } from "react";
import { Post } from "@/types/interfaces";

export default function PostFallback({
  post,
  canRemove,
  updatePost,
}: {
  post: Post;
  canRemove?: {
    id: string;
    uid: string;
    deleteURL: string;
  };
  updatePost?: Function;
}) {
  const { uid, deleteURL } = { ...canRemove };
  const [loading, setLoading] = useState(false);
  return (
    <div
      style={{
        padding: ".8rem",
        backgroundColor: "#ededed",
        overflow: "hidden",
      }}
    >
      <h3 style={{ fontWeight: "500", fontSize: "20px", margin: "10px 0" }}>
        Post Unavailable
      </h3>
      <p className="text-[16px] flex gap-2 flex-wrap mt-1 text-gray">
        This post is unavailable because it was deleted.
        {canRemove ? (
          <>
            {loading ? (
              <button
                style={{
                  background: "transparent",
                  marginLeft: ".5rem",
                  border: "0",
                }}
              >
                <Spinner size={14} style={{ margin: 0 }} />
              </button>
            ) : (
              <button
                title="Remove old post from news feed"
                aria-label="Remove old post from news feed"
                className="bg-transparent
                border-[1px]  border-gray hover:border-black hover:text-black transition-all duration-500 ease-in-out border-solid px-1"
                onClick={async (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setLoading(true);
                  await deletePost({
                    uid: String(uid),
                    deleteURL: String(deleteURL),
                    post,
                  });
                  setLoading(false);
                  updatePost?.(canRemove.id);
                }}
              >
                Remove
              </button>
            )}
          </>
        ) : null}
      </p>
    </div>
  );
}
