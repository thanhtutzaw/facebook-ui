import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { CSSProperties, useEffect, useState } from "react";
import { app } from "../lib/firebase";
import { signin } from "../lib/signin";
import styles from "../styles/Home.module.scss";
import GoogleLogo from "../components/GoogleLogo";
import Image from "next/image";
export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [Googleloading, setGoogleloading] = useState(false);
  const auth = getAuth(app);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      } else if (!user && router.pathname !== "/") {
        router.push("/login");
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);
  const email = "testuser@gmail.com";
  const password = "111111";
  const loginStyle: CSSProperties = {
    gap: "10px",
    padding: ".7rem",
    color: "white",
    backgroundColor: "#007af6",
    borderRadius: "50px",
    outline: "none",
    border: "1px solid rgba(0,0,0,.1)",
    cursor: "pointer",
    boxShadow: "0px 2px 20px #0000001f",
    wordBreak: "break-word",
    whiteSpace: "nowrap",
  };
  const handleTestUserSignin = () => {
    setLoading(true);
    try {
      setTimeout(() => {
        signin(email, password);
      }, 700);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };
  return (
    <section className={styles.login}>
      <button
        aria-label="Log in as Peter 1"
        disabled={loading}
        className={styles.SecondaryloginBtn}
        onClick={handleTestUserSignin}
      >
        <Image
          style={{ objectFit: "cover", borderRadius: "100px" }}
          width={35}
          height={35}
          alt="testuser photo"
          src={
            "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
          }
        />
        {loading ? "Logging in..." : "Log in as Peter 1"}
      </button>
      or
      <button
        className={styles.loginBtn}
        disabled={Googleloading}
        style={loginStyle}
      >
        <GoogleLogo />
        <p className="loginLabel">
          {Googleloading ? "Signing in" : "Continue with Google"}
        </p>
      </button>
      {/* <button className="AppLoginButton AppLoginButton--full AppLoginButton--google" type="button">
        <div className="AppLoginButton__icon"></div>
        <div className="AppLoginButton__textContainer">
          <div className="AppLoginButton__titleContainer">Continue with Google</div>
          <div className="AppLoginButton__subtitleContainer">Secured log-in</div>
        </div>
      </button> */}
    </section>
  );
}
