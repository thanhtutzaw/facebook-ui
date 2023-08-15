export function DevelopedByThanHtutZaw({ signup }: { signup?: boolean }) {
  return (
    <a
      style={{
        transform: !signup ? "none" : "translateY(80px)",
        transition: "transform .5s ease-in-out",
      }}
      tabIndex={-1}
      className="githublink"
      href="https://github.com/thanhtutzaw"
      target="_blank"
      rel="noreferrer"
    >
      <span
        style={{
          color: "gray",
          userSelect: "none",
        }}
      >
        Developed by{" "}
      </span>
      thanhtutzaw
    </a>
  );
}
