import styles from "../styles/Home.module.css";
import Link from "next/link";

export function Logo() {
  return (
    <div className={styles.logoContainer}>
      <Link href="/" className={styles.logo}>
        facebook
      </Link>
    </div>
  );
}
