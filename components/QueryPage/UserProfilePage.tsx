import UserProfile from "@/pages/[user]";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { useRouter } from "next/router";

export default function UserProfilePage({
  token,
  queryPageData,
}: {
  token: DecodedIdToken;
  queryPageData: any;
}) {
  const router = useRouter();

  if (!router.query.user) return null;
  const { profile, myPost, friendStatus } = queryPageData;
  return (
    <UserProfile
      token={token}
      profile={profile}
      myPost={myPost}
      friendStatus={friendStatus}
    />
  );
}
