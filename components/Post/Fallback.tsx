import { deletePost } from "@/lib/firestore/post";
import Spinner from "../Spinner";
import { useState } from "react";

export default function PostFallback({
  canRemove,
  updatePost,
}: {
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
      <p
        style={{
          color: "gray",
          marginTop: "4px",
          fontSize: "16px",
        }}
      >
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
                <Spinner size={14} style={{ margin: "0" }} />
              </button>
            ) : (
              <button
                style={{
                  background: "transparent",
                  marginLeft: ".5rem",
                  border: "1px solid black",
                }}
                onClick={async (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setLoading(true);
                  await deletePost({
                    uid: String(uid),
                    deleteURL: String(deleteURL),
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
