import Link from "next/link";
import s from "../styles/Home.module.scss";
import {
  faExclamationCircle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
function ErrorPage() {
  return (
    <div className="user">
      <div
        style={{
          textAlign: "center",
        }}
        className={s.userContent}
      >
        <p
          style={{
            color: "darkgray",
            fontSize: "2rem",
            margin: ".5rem 0",
          }}
        >
          <FontAwesomeIcon icon={faExclamationCircle} />
        </p>
        <h1
          style={{
            marginBottom: "0",
            fontSize: "clamp(25px,9vw,40px)",
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
