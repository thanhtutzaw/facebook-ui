import React from "react";
import { useRouter } from "next/router";
import UserProfilePage from "./UserProfilePage";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
/**
 * For better page transition UX and prevent SSR refetch .
 * Interception Route (Page Router)
 *
 */
function SecondaryPage({
  token,
  queryPageData,
}: {
  token?: DecodedIdToken | null;
  queryPageData: any;
}) {
  const router = useRouter();
  const isVisible =
    router.pathname !== "/" || JSON.stringify(router.query) === "{}";
    if(!token) return null;
  return (
    <div
      style={{
        display: isVisible ? "none" : "initial",
        position: "fixed",
        background: "rgba(0, 0, 0, 0.5)",
        inset: 0,
        maxWidth: "var(--main-width)",
        margin: "0 auto",
        backgroundColor: "#e7e7e7",
        overflowY: "scroll",
        // display: "grid",
        // alignContent: "center",
        // placeItems: "center",
        zIndex: "300000",
        // backdropFilter: "blur(2px)",
        // textTransform: "capitalize",
      }}
    >
      <UserProfilePage queryPageData={queryPageData} token={token} />
    </div>
  );
}

export default SecondaryPage;
