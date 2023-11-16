import { PageContext, PageProps } from "@/context/PageContext";
import { JSONTimestampToDate } from "@/lib/firebase";
import { checkPhotoURL } from "@/lib/firestore/profile";
import { account, friends } from "@/types/interfaces";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useContext } from "react";
import s from "./Friends.module.scss";
export default function Card(props: { children: ReactNode; f: friends }) {
  const { f } = props;
  const { preventClick } = useContext(PageContext) as PageProps;
  const date = f.createdAt as Timestamp;
  const author = f.author as account["profile"];
  const userName = `${author?.firstName ?? f.id} ${author?.lastName ?? ""}`;
  return (
    <Link
      scroll={false}
      as={String(f.id)}
      href={{ query: { user: String(f.id) } }}
      style={{ pointerEvents: preventClick ? "none" : "initial" }}
    >
      <div className={s.card}>
        <div
          style={{
            width: "80px",
            position: "relative",
            height: "80px",
          }}
        >
          <Image
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            loading="lazy"
            fill
            className={`w-[80px] h-[80px] rounded-full object-cover outline-[1px solid #8080802b] bg-avatarBg
            `}
            alt={f.id.toString()}
            src={checkPhotoURL(f.author?.photoURL as string)}
          />
        </div>
        <div className={s.right}>
          <div className={s.info}>
            <p>{userName}</p>
            {date && (
              <p className={s.date}>
                {JSONTimestampToDate(date).toLocaleDateString("en-US", {
                  year: "2-digit",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
          {props.children}
        </div>
      </div>
    </Link>
  );
}
