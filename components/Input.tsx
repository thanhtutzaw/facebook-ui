import { ReactNode, RefObject } from "react";
import s from "../styles/Home.module.scss";
import { HtmlProps } from "next/dist/shared/lib/html-context";

interface Props {
  contentEditable?: boolean;
  element?: RefObject<HTMLDivElement>;
  children?: ReactNode;
}
export default function Input({
  contentEditable = false,
  element,
  children,
}: Props) {
  return (
    <div
      ref={element}
      contentEditable={contentEditable}
      suppressContentEditableWarning={true}
      className={s.input}
    >
      {children}
    </div>
  );
}
