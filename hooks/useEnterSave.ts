import { RefObject, useEffect } from "react";

function useEnterSave(
  InputRef: RefObject<HTMLInputElement | HTMLDivElement>,
  buttonRef: RefObject<HTMLButtonElement>
) {
  useEffect(() => {
    const input = InputRef.current;
    function handleKeyPress(e: Event) {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key === "Enter" && !keyEvent.shiftKey) {
        e.preventDefault();
        buttonRef.current?.click();
      }
    }
    input?.addEventListener("keydown", handleKeyPress);
    return () => {
      input?.removeEventListener("keydown", handleKeyPress);
    };
  }, [InputRef, buttonRef]);
}

export default useEnterSave;
