import { CSSProperties, ReactNode, RefObject } from "react";
import s from "../styles/Home.module.scss";
import { HtmlProps } from "next/dist/shared/lib/html-context";

interface Props {
  style: CSSProperties;
  contentEditable?: boolean;
  element?: RefObject<HTMLDivElement>;
  children?: ReactNode;
}
export default function Input({
  style,
  contentEditable = false,
  element,
  children,
}: Props) {
  return (
    <div
      style={style}
      ref={element}
      contentEditable={contentEditable}
      suppressContentEditableWarning={true}
      className={s.input}
    >
      {children}
    </div>
  );
}
