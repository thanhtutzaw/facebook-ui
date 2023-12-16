import { CommentProps } from "@/pages/[user]/[post]";
import React, { useEffect, useRef, useState } from "react";
import Spinner from "../Spinner";
import { CommentItemProps } from "./CommentItem";
import s from "./index.module.scss";

export default function Comment(
  props: Partial<CommentProps> & {
    children?: JSX.Element[];
    commentNotFoundLoading?: boolean;
    preview?: boolean;
  }
) {
  const {
    parentId,
    nested = false,
    hasMore,
    commentEnd,
    comments,
    children,
    preview,
    commentNotFoundLoading,
  } = props;
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
    preview,
  };
  return (
    <>
      {commentNotFoundLoading && !nested && (
        <span
          id="commentNotFoundLoading"
          className="!p-0 h-[24px] flex justify-center items-center text-[16px] gap-2"
        >
          <Spinner />
        </span>
      )}
      <ul className={`${s.container}`}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const CommentItemClone = React.cloneElement(child, {
              ...childProps,
            });
            return CommentItemClone;
          }
        })}
      </ul>
      {!hasMore && !commentEnd
        ? null
        : hasMore && !commentEnd && comments && <Spinner />}
    </>
  );
}
