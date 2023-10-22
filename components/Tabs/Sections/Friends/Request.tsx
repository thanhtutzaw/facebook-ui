import { useQueryClient } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { PageContext, PageProps } from "@/context/PageContext";
import { acceptFriends, rejectFriendRequest } from "@/lib/firestore/friends";
import { AppProps } from "@/types/interfaces";
import Card from "./Card";
import s from "./Friends.module.scss";
import confirm from "public/assets/confirm-beep.mp3";
import useSound from "use-sound";
interface RequestProps {
  f: any;
  setrequestCount?: Function;
  tabIndex: number;
}
export function Request(props: RequestProps) {
  const { f, tabIndex, setrequestCount } = props;
  const queryClient = useQueryClient();
  const { currentUser } = useContext(PageContext) as PageProps;

  const [accept, setaccept] = useState(false);
  const [reject, setreject] = useState(false);
  const { uid } = useContext(AppContext) as AppProps;
  const [ConfirmLoaing, setConfirmLoaing] = useState(false);
  const [playAcceptSound] = useSound(confirm);
  async function handleConfirmRequest() {
    if (!uid) return;
    setConfirmLoaing(true);
    try {
      if (f.status !== "pending") {
        alert("Already Accepted!");
        setaccept(true);
        queryClient.invalidateQueries(["pendingFriends"]);
        queryClient.invalidateQueries(["suggestedFriends"]);
        return;
      }
      await acceptFriends(uid, f, currentUser);
      playAcceptSound();
      setConfirmLoaing(false);
      setaccept(true);
      queryClient.invalidateQueries(["pendingFriends"]);
      queryClient.invalidateQueries(["suggestedFriends"]);
    } catch (error) {
      setConfirmLoaing(false);
      console.log(error);
    }
  }
  async function handleRejectFriendRequest() {
    if (!uid) return;
    try {
      await rejectFriendRequest(uid, f);
      setreject(true);
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
