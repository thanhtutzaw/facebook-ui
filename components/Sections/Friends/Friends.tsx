import React, { useEffect } from "react";
import s from "./Friends.module.scss";
import { Request } from "./Request";
import { AddSuggestFriend } from "./AddSuggestFriend";
interface FriendProps {
  tabIndex: number;
}
export default function Friend(props: FriendProps) {
  useEffect(() => {
    console.log("Friend is Rendering");
  }, []);
  const { tabIndex } = props;

  const Requests = ["Aunt May", "Peter 2", "Peter 3"];
  const Suggestions = ["Captain America", "Iron Man", "Thor"];

  return (
    <div className={s.container}>
      <div className={s.action}>
        <button tabIndex={tabIndex}>Suggestions</button>
        <button tabIndex={tabIndex}>My Friends</button>
      </div>
      <div className={s.requestPending}>
        <h2 className={s.header}>
          <p>Friends Requests</p>
          {/* <p className={s.length}>{length}</p> */}
        </h2>
        {Requests.map((f, index) => (
          <Request key={index} f={f} tabIndex={tabIndex} />
        ))}
      </div>
      <div className={s.requestPending}>
        <h2 className={s.header}>
          <p>People you may know</p>
        </h2>
        {Suggestions.map((f, index) => (
          <AddSuggestFriend key={index} f={f} tabIndex={tabIndex} />
        ))}
      </div>
    </div>
  );
}
