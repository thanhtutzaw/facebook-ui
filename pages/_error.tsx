import Link from "next/link";
import BackHeader from "../components/Header/BackHeader";
import s from "../styles/Home.module.scss";
const ErrorPage = () => {
  return (
    <div className="user">
      <div
        style={{
          textAlign: "center",
          alignContent: "center",
          height: "calc(100dvh - 65px)",
        }}
        className={s.userContent}
      >
        <h3
          style={{
            fontWeight: "500",
          }}
        >
          404 - Couldn&apos;t find this Account
        </h3>
        <Link  tabIndex={-1 }href="/" style={{ background: "transparent" }}>
          <button className="goHome">Go Home</button>
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;