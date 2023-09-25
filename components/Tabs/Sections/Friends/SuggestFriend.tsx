import { useContext, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { addFriends } from "@/lib/firestore/friends";
import { AppProps, friends } from "@/types/interfaces";
import Card from "./Card";
import { useQueryClient } from "@tanstack/react-query";
import s from "./Friends.module.scss";
import { PageContext, PageProps } from "@/context/PageContext";
interface RequestProps {
  f: friends;
  tabIndex: number;
}
export function SuggestFriend(props: RequestProps) {
  const { f, tabIndex } = props;
  const queryClient = useQueryClient();
  const { currentUser } = useContext(PageContext) as PageProps;
  const { uid } = useContext(AppContext) as AppProps;
  const [accept, setaccept] = useState(false);
  const [reject, setreject] = useState(false);
  async function handleAddSuggestedFriend() {
    setaccept(true);
    if (!uid) return;
    await addFriends(uid, f, currentUser);
    queryClient.invalidateQueries(["suggestedFriends"]);
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
