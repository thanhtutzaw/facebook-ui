import React, { useState } from "react";
import s from "./Friends.module.scss";
import Card from "./Card";
interface RequestProps {
  f: string;
  tabIndex: number;
}
export function Request(props: RequestProps) {
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
