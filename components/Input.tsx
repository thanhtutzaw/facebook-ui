import { HTMLAttributes, CSSProperties, ReactNode, RefObject } from "react";
import s from "../styles/Home.module.scss";

interface Props {
  style?: CSSProperties;
  contentEditable?: boolean;
  element?: RefObject<HTMLDivElement>;
  children?: ReactNode;
  text?: string;
}
export default function Input({
  style,
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
