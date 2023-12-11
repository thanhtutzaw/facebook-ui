import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { DevelopedByThanHtutZaw } from "./DevelopedByThanHtutZaw";

export function Welcome({
  expired = false,
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
      router.push(router.asPath);
      console.log("expired and pushed(in Welcome.tsx)");
    }
  }, [expired, router.asPath]);
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (postError) {
      timeoutId = setTimeout(() => {
        setresourceError?.("");
      }, 5000);
    }
    return () => clearTimeout(timeoutId);
  }, [postError, setresourceError]);
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
            Apologies, our Firebase resources have reached their limit. Please
            try again in 24 hours. Thank you for your understanding.
          </p>
        </>
      ) : (
        <>
          <h2 className="bold-title select-none">Welcome Back 🎉</h2>
          <p className="select-none text-gray">Loading ...</p>
        </>
      )}
      <DevelopedByThanHtutZaw />
    </div>
  );
}
