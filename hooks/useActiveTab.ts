import { Tabs } from "@/types/interfaces";
import { useCallback, useEffect, useState } from "react";
/**
 *
 * A hook that switch Tabs and update Active state by document's visibility
 */
export function useActiveTab() {
  const [active, setActive] = useState("");
  const navigateTab = useCallback((targetTab: Tabs) => {
    setActive(targetTab);
    const target = document.getElementById(targetTab);
    target?.scrollIntoView();
  }, []);

  useEffect(() => {
    const tabs = document.querySelectorAll("#tabs > div");
    let options = {
      root: document.querySelector("#tabs"),
      rootMargin: "0px",
      threshold: 1,
    };
    function handleObserver(entries: IntersectionObserverEntry[]) {
      entries.map((entry) => {
        if (entry.isIntersecting) {
          const targetID = entry.target.id as Tabs;
          // window.location.hash = targetID === "/" ? "home" : targetID;
          setActive(targetID);
        }
      });
    }
    const observer = new IntersectionObserver(handleObserver, options);
    tabs.forEach((item) => {
      observer.observe(item);
    });

    return () => {
      tabs.forEach((item) => {
        observer.unobserve(item);
      });
    };
  }, [active]);

  return { active: active as Tabs, setActive, navigateTab };
}
