import Spinner from "@/components/Spinner";
import useFriends from "@/hooks/useFriends";
import router from "next/router";
import { memo } from "react";
import s from "./Friends.module.scss";
import { Request } from "./Request";
import { SuggestFriend } from "./SuggestFriend";
interface FriendProps {
  tabIndex: number;
}
function Friend(props: FriendProps) {
  const { tabIndex } = props;

  const { suggestedFriends, pendingFriends } = useFriends();
  const suggested = suggestedFriends.data ?? [];

  const pending = pendingFriends.data ?? [];
  const suggestedFriendsError = suggestedFriends.error as {
    code: string;
    name: string;
  };
  return (
    <div tabIndex={tabIndex} className={s.container}>
      <div className={`flex flex-wrap pb-[10px] px-4 ${s.action}`}>
        <button
          aria-label="Go to my friends page"
          title="Go to my friends page"
          tabIndex={tabIndex}
          className={s.item}
          onClick={() => {
            router.push("/suggestions");
          }}
        >
          Suggestions
        </button>
        <button
          aria-label="Go to my friends page"
          title="Go to my friends page"
          tabIndex={tabIndex}
          className={s.item}
          onClick={() => {
            router.push("/friends");
          }}
        >
          All Friends
        </button>
      </div>
      {pending.length > 0 && (
        <div className={s.request}>
          <h2 className={`bold-title ${s.header}`}>
            <p>
              Friends Requests{" "}
              <span className="text-red">{pending.length}</span>
            </p>
          </h2>
          {pending.map((friend) => (
            <Request key={friend.id.toString()} friend={friend} tabIndex={tabIndex} />
          ))}
        </div>
      )}
      <div className={s.suggest}>
        {suggested.length > 0 && (
          <h2 className={`bold-title ${s.header}`}>
            <p>People you may know</p>
          </h2>
        )}
        {suggestedFriends.isLoading ? (
          <Spinner />
        ) : suggestedFriends.error ? (
          <div className="error flex-col justify-center items-center ">
            <h1 className="m-0">Unexpected Error Occured !</h1>
            {suggestedFriendsError.code && (
              <p className="m-0 ">
                {suggestedFriendsError.name} : {suggestedFriendsError.code}
              </p>
            )}
          </div>
        ) : (
          <>
            {suggested.map((friend) => (
              <SuggestFriend key={friend.id} friend={friend} tabIndex={tabIndex} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
export default memo(Friend);
