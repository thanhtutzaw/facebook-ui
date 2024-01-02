import { useAppContext } from "@/context/AppContext";
import { usePageContext } from "@/context/PageContext";
import useQueryFn from "@/hooks/useQueryFn";
import { addFriends } from "@/lib/firestore/friends";
import { friends } from "@/types/interfaces";
import { useState } from "react";
import Card from "./Card";
import s from "./Friends.module.scss";
interface RequestProps {
  f: friends;
  tabIndex: number;
}
export function SuggestFriend(props: RequestProps) {
  const { f, tabIndex } = props;
  const { currentUser } = usePageContext();
  const { uid } = useAppContext();
  const [accept, setaccept] = useState(false);
  const [reject, setreject] = useState(false);
  const { queryFn } = useQueryFn();
  async function handleAddSuggestedFriend() {
    setaccept(true);
    if (!uid) return;
    await addFriends(uid, f, currentUser);
    queryFn.invalidate("suggestedFriends");
  }
  function handleSuggestDelete() {
    setreject(true);
  }
  return (
    <Card f={f}>
      <div className={s.action}>
        {accept ? (
          "Request Sended"
        ) : reject ? (
          "Deleted"
        ) : (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleAddSuggestedFriend();
              }}
              tabIndex={tabIndex}
              className={s.primary}
            >
              Add Friend
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleSuggestDelete();
              }}
              tabIndex={tabIndex}
              className={s.secondary}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </Card>
  );
}
