import { CommentProps } from "@/pages/[user]/[post]";
import React, { ReactElement, useEffect, useRef, useState } from "react";
import Spinner from "../Spinner";
import { CommentItemProps } from "./CommentItem";
import s from "./index.module.scss";

export default function Comment(
  props: Partial<CommentProps> & {
    children?: JSX.Element[];
    item?: ReactElement;
  }
) {
  const { parentId, nested = false, hasMore, commentEnd, comments } = props;
  const clientRef = useRef(false);
  const client = clientRef.current;

  const [editToggle, seteditToggle] = useState("");
  useEffect(() => {
    const updateClient = () => {
      clientRef && (clientRef.current = true);
    };
    updateClient();
  }, []);
  const [toggleCommentMenu, settoggleCommentMenu] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  if (comments?.length === 0) return <></>;
  const childProps: Partial<CommentItemProps> = {
    client,
    editToggle,
    seteditToggle,
    toggleCommentMenu,
    settoggleCommentMenu,
    menuRef,
    parentId,
    nested,
  };
  return (
    <>
      <ul className={`${s.container}`}>
        {React.Children.map(props.children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, childProps);
          }
        })}
      </ul>
      {!hasMore && !commentEnd
        ? null
        : hasMore && !commentEnd && comments && <Spinner />}
    </>
  );
}
