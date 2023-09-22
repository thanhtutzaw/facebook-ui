import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DevelopedByThanHtutZaw } from "./DevelopedByThanHtutZaw";

export function Welcome({
  expired=false,
  postError = "",
  setresourceError,
}: {
  expired?: boolean;
  setresourceError?: Function;
  postError?: string;
}) {
  const router = useRouter();
  useEffect(() => {
    if (expired) {
      router.push("/");
      console.log("expired and pushed(in Welcome.tsx)");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (postError) {
      t = setTimeout(() => {
        setresourceError?.("");
      }, 5000);
    }
    return () => clearTimeout(t);
  }, [postError, setresourceError]);
  // if (postError !== "") return null;
  return (
    <div
      style={{
        opacity: "0",
        animation: "blink .8s forwards ease-in-out",
        cursor: postError ? "initial" : "wait",
        display: "grid",
        alignContent: "center",
        justifyItems: "center",
        textAlign: "center",
        height: "100dvh",
      }}
    >
      {postError !== "" ? (
        <>
          <p className="error">
            <FontAwesomeIcon icon={faCircleExclamation} />
            {/* {postError} */}
            Apologies, our Firebase resources have reached their limit. Please
            try again in 24 hours. Thank you for your understanding.
          </p>
          {/* <p
            style={{
              marginTop: "auto",
              color: "gray",
              width: "90%",
              // textAlign: "left",
            }}
          >
            </p> */}
          {/* {postError} */}
          {/* Apologies, our Firebase resources have reached their limit. Please
            try again in 24 hours. Thank you for your understanding. */}
        </>
      ) : (
        <>
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
        </>
      )}
      <DevelopedByThanHtutZaw />
    </div>
  );
}
