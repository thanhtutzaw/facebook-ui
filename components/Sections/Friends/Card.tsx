import Image from "next/image";
import Link from "next/link";
import React, { ReactNode } from "react";
import s from "./Friends.module.scss";
export default function Card(props: { children: ReactNode; f: any }) {
  const { f } = props;
  return (
    <Link href={f}>
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
          {props.children}
        </div>
      </div>
    </Link>
  );
}
