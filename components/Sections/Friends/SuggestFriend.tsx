import { useContext, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import { addFriends } from "../../../lib/firestore/friends";
import { Props, friends } from "../../../types/interfaces";
import Card from "./Card";
import s from "./Friends.module.scss";
interface RequestProps {
  f: friends;
  tabIndex: number;
}
export function SuggestFriend(props: RequestProps) {
  const { f, tabIndex } = props;
  const { uid } = useContext(AppContext) as Props;
  const [accept, setaccept] = useState(false);
  const [reject, setreject] = useState(false);
  async function handleAddFriend() {
    setaccept(true);
    if (!uid) return;
    await addFriends(uid , f);
  }
  function handleReject() {
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
                handleAddFriend();
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
                handleReject();
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
