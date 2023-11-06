import { HTMLAttributes, CSSProperties, ReactNode, RefObject } from "react";
import s from "@/styles/Home.module.scss";

interface AppProps {
  style?: CSSProperties;
  contentEditable?: boolean;
  element?: RefObject<HTMLDivElement>;
  children?: ReactNode;
  text?: string;
}
export default function TextInput({
  style,
  element,
  children,
  text,
  ...props
}: AppProps & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      aria-multiline="true"
      aria-label="text"
      spellCheck="true"
      style={style}
      ref={element}
      suppressContentEditableWarning={true}
      className={s.input}
    >
      {children}
    </div>
  );
}
