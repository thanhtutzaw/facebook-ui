import { AppContext } from "@/context/AppContext";
import { PageContext, PageProps } from "@/context/PageContext";
import useQueryFn from "@/hooks/useQueryFn";
import { addFriends } from "@/lib/firestore/friends";
import { AppProps, friends } from "@/types/interfaces";
import { useContext, useState } from "react";
import Card from "./Card";
import s from "./Friends.module.scss";
interface RequestProps {
  f: friends;
  tabIndex: number;
}
export function SuggestFriend(props: RequestProps) {
  const { f, tabIndex } = props;
  const { currentUser } = useContext(PageContext) as PageProps;
  const { uid } = useContext(AppContext) as AppProps;
  const [accept, setaccept] = useState(false);
  const [reject, setreject] = useState(false);
  const {queryFn } = useQueryFn();
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
