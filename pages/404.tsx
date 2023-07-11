import Link from "next/link";
import s from "../styles/Home.module.scss";
function ErrorPage() {
  return (
    <div className="user">
      <div
        style={{
          textAlign: "center",
          // alignContent: "center",
          // height: "calc(100dvh - 65px)",
        }}
        className={s.userContent}
      >
        <h1
          style={{
            marginBottom: "0",

            fontWeight: "500",
          }}
        >
          404 - Couldn&apos;t find this Account
        </h1>
        <p>We can&apos;t find the page you are looking for</p>
        <Link href="/" className="goHome">
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default ErrorPage;
