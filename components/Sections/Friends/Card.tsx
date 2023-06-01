import Image from "next/image";
import Link from "next/link";
import React, { ReactNode, useContext } from "react";
import s from "./Friends.module.scss";
import { AppContext } from "../../../context/AppContext";
import { Props } from "../../../types/interfaces";
export default function Card(props: { children: ReactNode; f: any }) {
  const { f } = props;
  const { preventClick } = useContext(AppContext) as Props;
  return (
    <Link
      scroll={false}
      href={"rEvJE0sb1yVJxfHTbtn915TSfqJ2"}
      style={{ pointerEvents: preventClick ? "none" : "initial" }}
    >
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
