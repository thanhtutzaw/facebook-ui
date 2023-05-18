import React, { useState } from "react";
import s from "./Friends.module.scss";
import Image from "next/image";
import Card from "./Card";
interface RequestProps {
  f: string;
  tabIndex: number;
}
export function AddSuggestFriend(props: RequestProps) {
  const { f, tabIndex } = props;
  const [accept, setaccept] = useState(false);
  const [reject, setreject] = useState(false);
  function handleConfirmRequest() {
    setaccept(true);
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
                handleConfirmRequest();
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
