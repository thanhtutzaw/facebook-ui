import { useContext, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import {
  acceptFriends,
  rejectFriendRequest,
} from "../../../lib/firestore/friends";
import { useQueryClient } from "@tanstack/react-query";
import { Props } from "../../../types/interfaces";
import Card from "./Card";
import s from "./Friends.module.scss";
interface RequestProps {
  f: any;
  setrequestCount?: Function;
  tabIndex: number;
}
export function Request(props: RequestProps) {
  const { f, tabIndex, setrequestCount } = props;
  const queryClient = useQueryClient();

  const [accept, setaccept] = useState(false);
  const [reject, setreject] = useState(false);
  const { uid } = useContext(AppContext) as Props;
  async function handleConfirmRequest() {
    setaccept(true);
    if (!uid) return;
    try {
      await acceptFriends(uid, f);
      // setrequestCount((prev: number) => prev - 1);
      queryClient.invalidateQueries(["pendingFriends"]);
      // queryClient.refetchQueries(["pendingFriends"]);
    } catch (error) {
      console.log(error);
    }
  }
  async function handleRejectFriendRequest() {
    setreject(true);
    if (!uid) return;
    try {
      await rejectFriendRequest(uid, f);
      // setrequestCount((prev: number) => prev - 1);
      queryClient.invalidateQueries(["pendingFriends"]);
      // queryClient.refetchQueries(["pendingFriends"]);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Card f={f}>
      <div className={s.action}>
        {accept ? (
          "You're now friends"
        ) : reject ? (
          "Request Deleted"
        ) : (
          <>
            <button
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
