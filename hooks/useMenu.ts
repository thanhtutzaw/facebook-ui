import { RefObject, useEffect, useRef } from "react";
import useEscape from "./useEscape";

export default function useMenu(
  friendMenuToggle: boolean,
  setFriendMenuToggle: Function
) {
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log(e.target);
      console.log(friendMenuToggle);
      if (friendMenuToggle) {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          setFriendMenuToggle(false);
        }
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [friendMenuToggle, menuRef, setFriendMenuToggle]);
  useEscape(() => {
    if (friendMenuToggle) {
      setFriendMenuToggle(false);
    }
  });
  return { menuRef };
}
