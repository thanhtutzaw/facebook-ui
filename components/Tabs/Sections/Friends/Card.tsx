import { usePageContext } from "@/context/PageContext";
import { JSONTimestampToDate } from "@/lib/firebase";
import { checkPhotoURL } from "@/lib/firestore/profile";
import { account, friend } from "@/types/interfaces";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import s from "./Friends.module.scss";
export default function Card({
  friend,
  children,
}: {
  friend: friend;
  children: ReactNode;
}) {
  const { preventClick } = usePageContext();
  const date = friend.createdAt as Timestamp;
  const author = friend.author as account["profile"];
  const userName = `${author?.firstName ?? friend.id} ${author?.lastName ?? ""}`;
  const friendId = String(friend.id);
  return (
    <Link
      scroll={false}
      as={friendId}
      href={{ query: { user: friendId } }}
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
            alt={String(friend.id)}
            src={checkPhotoURL(friend.author?.photoURL as string)}
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
          {children}
        </div>
      </div>
    </Link>
  );
}
