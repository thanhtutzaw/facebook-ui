import UserProfile from "@/pages/[user]";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { useRouter } from "next/router";

export default function UserProfilePage({
  token,
  queryPageData,
}: {
  token: DecodedIdToken;
  queryPageData: unknown;
}) {
  const router = useRouter();

  if (!router.query.user) return null;
  const { profile, myPost, friendStatus, hasMore } = queryPageData as any;
  return (
    <UserProfile
      hasMore={hasMore}
      token={token}
      profile={profile}
      myPost={myPost}
      friendStatus={friendStatus}
    />
  );
}
