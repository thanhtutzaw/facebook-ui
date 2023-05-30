import { useEffect } from "react";

export default function useEscape(escape: Function) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (!(e.key === "Escape")) return;
      escape();
    }
    window.addEventListener("keyup", handleEscape);
    return () => window.removeEventListener("keyup", handleEscape);
  }, [escape]);
}
