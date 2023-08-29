import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useContext } from "react";
import { PageContext, PageProps } from "../../../context/PageContext";
import { account, friends } from "../../../types/interfaces";
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
      href={f.id?.toString() ?? ""}
      style={{ pointerEvents: preventClick ? "none" : "initial" }}
    >
      <div className={s.card}>
        {/* {preventClick?.current ? "true" : "false"} */}
        <Image
          className={s.profile}
          alt={"name"}
          width={100}
          height={100}
          src={
            (f.author?.photoURL as string) ??
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
          }
        />
        <div className={s.right}>
          <div className={s.info}>
            {/* <p>{f.id}</p> */}
            <p>{userName}</p>
            {date && (
              <p className={s.date}>
                {new Timestamp(date?.seconds, date?.nanoseconds)
                  .toDate()
                  .toLocaleDateString("en-US", {
                    year: "2-digit",
                    month: "short",
                    day: "numeric",
                  })}
                {/* {JSON.stringify(f.createdAt)} */}

                {/* {new Timestamp(f.createdAt.nanoseconds, f.createdAt.seconds)
                .toDate()
                .toLocaleDateString()} */}
                {/* {new Timestamp(f.createdAt?.seconds, f.createdAt?.nanoseconds)
                .toDate()
                .toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })} */}
              </p>
            )}
          </div>
          {props.children}
        </div>
      </div>
    </Link>
  );
}
