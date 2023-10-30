import Spinner from "@/components/Spinner";
import useFriends from "@/hooks/useFriends";
import router from "next/router";
import s from "./Friends.module.scss";
import { Request } from "./Request";
import { SuggestFriend } from "./SuggestFriend";
interface FriendProps {
  tabIndex: number;
}
export default function Friend(props: FriendProps) {
  const { tabIndex } = props;
  const { suggestedFriends, pendingFriends } = useFriends();
  const suggested = suggestedFriends.data ?? [];
  const pending = pendingFriends.data ?? [];
  return (
    <div className={s.container}>
      <div className={`pb-[10px] px-4 ${s.action}`}>
        <button tabIndex={tabIndex}>Suggestions</button>
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
          {pending.map((f) => (
            <Request key={f.id.toString()} f={f} tabIndex={tabIndex} />
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
          <p className="error">Unexpected Error Occured !</p>
        ) : (
          <>
            {suggested?.map((f: any) => (
              <SuggestFriend key={f.id} f={f} tabIndex={tabIndex} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
