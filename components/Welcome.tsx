import router, { useRouter } from "next/router";
import { useEffect } from "react";

export function Welcome({ expired }: { expired: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (expired) {
      router.push("/");
      console.log("expired and pushed(in Welcome.tsx)");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);

  return (
    <div
      style={{
        opacity: "0",
        animation: "blink .8s forwards ease-in-out",
        cursor: "wait",
        display: "grid",
        alignContent: "center",
        justifyItems: "center",
        textAlign: "center",
        height: "100vh",
      }}
    >
      <h2
        style={{
          userSelect: "none",
        }}
      >
        Welcome Back 🎉
      </h2>
      <p
        style={{
          userSelect: "none",
          // opacity: "0",
          // animation: "blink 1s infinite ease-in-out",
          color: "gray",
        }}
      >
        Loading ...
      </p>
      <a
        className="githublink"
        href="https://github.com/thanhtutzaw"
        target="_blank"
        rel="noreferrer"
      >
        <span
          style={{
            color: "gray",
          }}
        >
          Developed by{" "}
        </span>
        thanhtutzaw
      </a>
    </div>
  );
}
