import { useAppContext } from "@/context/AppContext";
import { usePageContext } from "@/context/PageContext";
import useQueryFn from "@/hooks/useQueryFn";
import { acceptFriends, rejectFriendRequest } from "@/lib/firestore/friends";
import { friend } from "@/types/interfaces";
import confirm from "public/assets/confirm-beep.mp3";
import { useState } from "react";
import useSound from "use-sound";
import Card from "./Card";
import s from "./Friends.module.scss";
interface RequestProps {
  friend: friend;
  tabIndex: number;
}
export function Request({ friend, tabIndex }: RequestProps) {
  const { currentUser } = usePageContext();
  const { queryFn } = useQueryFn();
  const [accept, setaccept] = useState(false);
  const [reject, setreject] = useState(false);
  const { uid } = useAppContext();
  const [ConfirmLoaing, setConfirmLoaing] = useState(false);
  const [playAcceptSound] = useSound(confirm);
  async function handleConfirmRequest() {
    if (!uid) return;
    setConfirmLoaing(true);
    try {
      if (friend.status !== "pending") {
        alert("Already Accepted!");
        setaccept(true);
        queryFn.invalidate("pendingFriends");
        queryFn.invalidate("suggestedFriends");
        return;
      }
      await acceptFriends(uid, friend, currentUser);
      playAcceptSound();
      setConfirmLoaing(false);
      setaccept(true);
      queryFn.invalidate("pendingFriends");
      queryFn.invalidate("suggestedFriends");
    } catch (error) {
      setConfirmLoaing(false);
      console.log(error);
    }
  }
  async function handleRejectFriendRequest() {
    if (!uid) return;
    try {
      await rejectFriendRequest(uid, friend);
      setreject(true);
      queryFn.invalidate("pendingFriends");
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Card friend={friend}>
      <div className={s.action}>
        {accept ? (
          "You're now friends"
        ) : reject ? (
          "Request Deleted"
        ) : (
          <>
            <button
              disabled={ConfirmLoaing}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleConfirmRequest();
              }}
              tabIndex={tabIndex}
              className={s.primary}
            >
              Confirm
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleRejectFriendRequest();
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
