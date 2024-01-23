import AddPost from "@/pages/addPost";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
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
  token?: DecodedIdToken | null;
  queryPageData: unknown;
}) {
  const router = useRouter();
  const toggleAddPost = router.asPath.includes("addPost");
  const isVisible = queryPageData || toggleAddPost;
  // console.log({asPathInQPage:router.asPath});
  // const hash = router.asPath.split("#")[1];
  // const parsedHash = new URLSearchParams(hash);
  // const toggleAddPost = parsedHash.has("addPost");
  console.log(toggleAddPost);
  if (!token) return null;
  return (
    <div
      style={{
        display: isVisible ? "initial" : "none",
        position: "fixed",
        background: "rgba(0, 0, 0, 0.5)",
        inset: 0,
        maxWidth: "var(--main-width)",
        margin: "0 auto",
        backgroundColor: "#e7e7e7",
        overflowY: "scroll",
        zIndex: "300000",
      }}
    >
      {toggleAddPost && <AddPost />}
      <UserProfilePage queryPageData={queryPageData} token={token} />
    </div>
  );
}

export default SecondaryPage;
