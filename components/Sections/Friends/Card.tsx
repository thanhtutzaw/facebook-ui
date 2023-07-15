import Image from "next/image";
import Link from "next/link";
import { ReactNode, useContext } from "react";
import { PageContext, PageProps } from "../../../context/PageContext";
import s from "./Friends.module.scss";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
export default function Card(props: {
  children: ReactNode;
  f: { id: string; author: UserRecord; profile: any };
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
            <p>{f?.author?.displayName ?? f?.id ?? f}</p>
            <p>1min</p>
          </div>
          {props.children}
        </div>
      </div>
    </Link>
  );
}
