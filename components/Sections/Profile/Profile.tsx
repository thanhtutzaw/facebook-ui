import React from "react";
import s from "./Profile.module.scss"
import { Props } from "../../../pages/index";
export default function Profile(props: Props) {
  const { email } = props;
  return (
    <div className={s.container}>
      <p>{email}</p>
    </div>
  );
}
