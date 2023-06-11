import { HTMLAttributes, CSSProperties, ReactNode, RefObject } from "react";
import s from "../styles/Home.module.scss";
import { HtmlProps } from "next/dist/shared/lib/html-context";
import { text } from "@fortawesome/fontawesome-svg-core";

interface Props {
  style?: CSSProperties;
  contentEditable?: boolean;
  element?: RefObject<HTMLDivElement>;
  children?: ReactNode;
  text?: string;
}
export default function Input({
  style,
  // contentEditable = false,
  element,
  children,
  text,
  ...props
}: Props & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      aria-multiline="true"
      spellCheck="true"
      style={style}
      ref={element}
      // dangerouslySetInnerHTML={{ __html: text! }}
      suppressContentEditableWarning={true}
      className={s.input}
    >
      {children}
    </div>
  );
}
