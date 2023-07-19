export default function SharePostFallback() {
  return (
    <div
      style={{
        scale: ".9",
        padding: "1.5rem 1rem",
        backgroundColor: "#ededed",
        marginBottom: "1rem",
      }}
    >
      <h3>Post Unavailable</h3>
      <p>This post is unavailable because it was deleted.</p>
    </div>
  );
}
