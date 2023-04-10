import React, { useState } from "react";
import s from "./Friends.module.scss";
import Image from "next/image";
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
    <div className={s.card}>
      <Image
        className={s.profile}
        alt={"name"}
        width={80}
        height={80}
        src={
          "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
        }
      />
      <div className={s.right}>
        <div className={s.info}>
          <p>{f}</p>
          <p>1min</p>
        </div>
        <div className={s.action}>
          {accept ? (
            "You're now friends"
          ) : reject ? (
            "Request Deleted"
          ) : (
            <>
              <button
                onClick={handleConfirmRequest}
                tabIndex={tabIndex}
                className={s.primary}
              >
                Confirm
              </button>
              <button
                onClick={handleReject}
                tabIndex={tabIndex}
                className={s.secondary}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
