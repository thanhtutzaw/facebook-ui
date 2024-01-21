import { useAppContext } from "@/context/AppContext";
import { usePageContext } from "@/context/PageContext";
import useQueryFn from "@/hooks/useQueryFn";
import { addFriends } from "@/lib/firestore/friends";
import { friend} from "@/types/interfaces";
import { useState } from "react";
import Card from "./Card";
import s from "./Friends.module.scss";
interface RequestProps {
  friend: friend;
  tabIndex: number;
}
export function SuggestFriend({ friend, tabIndex }: RequestProps) {
  const { currentUser } = usePageContext();
  const { uid } = useAppContext();
  const [accept, setaccept] = useState(false);
  const [reject, setreject] = useState(false);
  const { queryFn } = useQueryFn();
  async function handleAddSuggestedFriend() {
    setaccept(true);
    if (!uid) return;
    await addFriends(uid, friend, currentUser);
    queryFn.invalidate("suggestedFriends");
  }
  function handleSuggestDelete() {
    setreject(true);
  }
  return (
    <Card friend={friend}>
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
