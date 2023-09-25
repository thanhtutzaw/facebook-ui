import React from "react";
import { useRouter } from "next/router";
import UserProfilePage from "./UserProfilePage";
/**
 * For better page transition UX and prevent SSR refetch .
 * Interception Route (Page Router)
 *
 */
function SecondaryPage({
  token,
  queryPageData,
}: {
  token: any;
  queryPageData: any;
}) {
  const router = useRouter();
  if (router.pathname !== "/" || JSON.stringify(router.query) === "{}")
    return null;
  return (
    <div
      style={{
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
        zIndex: "10000",
        // backdropFilter: "blur(2px)",
        // padding: "1rem",
        // textTransform: "capitalize",
      }}
    >
      {router.query.user && (
        <UserProfilePage queryPageData={queryPageData} token={token} />
      )}
    </div>
  );
}

export default SecondaryPage;
