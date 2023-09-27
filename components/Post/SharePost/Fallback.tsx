export default function SharePostFallback() {
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
      </p>
    </div>
  );
}
