import React from "react";
import s from "./Profile.module.scss";
import { Props } from "../../../pages/index";
import Image from "next/image";
export default function Profile(props: Props) {
  const { email } = props;
  return (
    <div className={s.container}>
      <>
        <Image
          className={s.profile}
          alt={email || ""}
          width={120}
          height={120}
          src={
            "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
          }
        />
        <p>User: {email ? email : "Null"}</p>
      </>
    </div>
  );
}
