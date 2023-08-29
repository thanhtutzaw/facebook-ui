import React, { useContext, useState } from "react";
import s from "./Friends.module.scss";
import Card from "./Card";
import { acceptFriends } from "../../../lib/firestore/friends";
import { AppContext } from "../../../context/AppContext";
import { Props } from "../../../types/interfaces";
interface RequestProps {
  f: any;
  tabIndex: number;
}
export function Request(props: RequestProps) {
  const { f, tabIndex } = props;
  const [accept, setaccept] = useState(false);
  const [reject, setreject] = useState(false);
  const { uid } = useContext(AppContext) as Props;
  async function handleConfirmRequest() {
    setaccept(true);
    if (!uid) return;
    try {
      await acceptFriends(uid, f);
    } catch (error) {
      console.log(error);
    }
  }
  function handleReject() {
    setreject(true);
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
