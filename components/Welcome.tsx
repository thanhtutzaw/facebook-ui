import router, { useRouter } from "next/router";
import { useEffect } from "react";
import { DevelopedByThanHtutZaw } from "./DevelopedByThanHtutZaw";
import {
  faCircleExclamation,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Spinner from "./Spinner";

export function Welcome({
  uid,
  expired,
  postError = "",
}: {
  uid: string | undefined;
  expired: boolean;
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
            {postError}
          </p>
          <p
            style={{
              marginTop: "auto",
              color: "gray",
              width: "90%",
              // textAlign: "left",
            }}
          >
            Apologies, our Firebase resources have reached their limit. Please
            try again in 24 hours. Thank you for your understanding.
          </p>
        </>
      ) : uid ? (
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
      ) : (
        <Spinner />
      )}
      <DevelopedByThanHtutZaw />
    </div>
  );
}
