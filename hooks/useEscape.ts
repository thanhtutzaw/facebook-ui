import { useEffect } from "react";
/**
 * 
 * A hook that trigger function when Escape key released
 * @param escape a function
 */
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
