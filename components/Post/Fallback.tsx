import { deletePost } from "@/lib/firestore/post";

export default function PostFallback({
  canRemove,
}: {
  canRemove?: {
    uid: string;
    deleteURL: string;
  };
}) {
  const { uid, deleteURL } = { ...canRemove };
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
          <button
            style={{
              background: "transparent",
              marginLeft: ".5rem",
              border: "1px solid black",
            }}
            onClick={async () => {
              await deletePost({
                uid:String(uid),
                deleteURL:String(deleteURL),
              });
            }}
          >
            Remove
          </button>
        ) : null}
      </p>
    </div>
  );
}
