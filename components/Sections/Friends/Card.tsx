import Image from "next/image";
import Link from "next/link";
import { ReactNode, useContext, useEffect } from "react";
import { PageContext, PageProps } from "../../../context/PageContext";
import s from "./Friends.module.scss";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { account } from "../../../types/interfaces";
export default function Card(props: {
  children: ReactNode;
  f: { id: string; author: account["profile"] };
}) {
  const { f } = props;
  const { preventClick } = useContext(PageContext) as PageProps;

  return (
    <Link
      scroll={false}
      // href={f.id}
      href={f.id?.toString() ?? ""}
      style={{ pointerEvents: preventClick ? "none" : "initial" }}
    >
      <div className={s.card}>
        {/* {preventClick?.current ? "true" : "false"} */}
        <Image
          className={s.profile}
          alt={"name"}
          width={80}
          height={80}
          src={
            (f.author?.photoURL as string) ??
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
          }
        />
        <div className={s.right}>
          <div className={s.info}>
            <p>{`${f.author?.firstName ?? f.id} ${
              f.author?.lastName ?? ""
            }`}</p>
            <p>1min</p>
          </div>
          {props.children}
        </div>
      </div>
    </Link>
  );
}
