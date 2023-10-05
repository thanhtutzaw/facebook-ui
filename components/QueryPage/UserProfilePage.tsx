import UserProfile from "@/pages/[user]";
import { useRouter } from "next/router";

export default function UserProfilePage({
  token,
  queryPageData,
}: {
  token: any;
  queryPageData: any;
}) {
  const router = useRouter();

  if (!router.query.user) return null;
  const {
    profile,
    myPost,
    isFriend,
    isBlocked,
    isPending,
    canAccept,
    canUnBlock,
  } = queryPageData;
  return (
    <UserProfile
      token={token}
      profile={profile}
      myPost={myPost}
      isFriend={isFriend}
      isBlocked={isBlocked}
      isPending={isPending}
      canAccept={canAccept}
      canUnBlock={canUnBlock}
    />
  );
}
