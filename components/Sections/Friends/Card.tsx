import Image from "next/image";
import Link from "next/link";
import { ReactNode, useContext } from "react";
import { PageContext, PageProps } from "../../../context/PageContext";
import s from "./Friends.module.scss";
export default function Card(props: { children: ReactNode; f: any }) {
  const { f } = props;
  const { preventClick } = useContext(PageContext) as PageProps;
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
