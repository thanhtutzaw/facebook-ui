import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { app } from "../lib/firebase";
import { signin } from "../lib/signin";
// import { useUser } from "../hooks/useUser";
export default function Login() {
  const router = useRouter();
  const auth = getAuth(app);
//   const user = useUser();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      } else {
        console.log("no user in index");
        router.push("/login");
      }
    });
  }, []);

  const email = "testuser@gmail.com";
  const password = "111111";
  return (
    <>
      <input
        style={{ cursor: "not-allowed" }}
        type="email"
        value={email}
        readOnly
      />
      <input
        style={{ cursor: "not-allowed" }}
        type="text"
        value={password}
        readOnly
      />
      <button
        onClick={() => {
          signin(email, password);
        }}
      >
        Sign in as testUser
      </button>
    </>
  );
}