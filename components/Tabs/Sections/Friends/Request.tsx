import { AppContext } from "@/context/AppContext";
import { PageContext, PageProps } from "@/context/PageContext";
import useQueryFn from "@/hooks/useQueryFn";
import { acceptFriends, rejectFriendRequest } from "@/lib/firestore/friends";
import { AppProps } from "@/types/interfaces";
import confirm from "public/assets/confirm-beep.mp3";
import { useContext, useState } from "react";
import useSound from "use-sound";
import Card from "./Card";
import s from "./Friends.module.scss";
interface RequestProps {
  f: any;
  setrequestCount?: Function;
  tabIndex: number;
}
export function Request(props: RequestProps) {
  const { f, tabIndex, setrequestCount } = props;
  const { currentUser } = useContext(PageContext) as PageProps;
  const { queryFn } = useQueryFn();
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
        queryFn.invalidate("pendingFriends");
        queryFn.invalidate("suggestedFriends");
        return;
      }
      await acceptFriends(uid, f, currentUser);
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
      await rejectFriendRequest(uid, f);
      setreject(true);
      queryFn.invalidate("pendingFriends");
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
