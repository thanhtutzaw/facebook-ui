import { Tabs } from "@/types/interfaces";
import { useState, useEffect } from "react";
/**
 *
 * A hook that switch Tabs and update Active state by document's visibility
 */
export function useActive() {
  const [active, setActive] = useState<Tabs>("/");
  function navigateTab(targetTab: Tabs) {
    setActive(targetTab);
    const target = document.getElementById(targetTab);
    target?.scrollIntoView();
  }
  useEffect(() => {
    const tabs = document.querySelectorAll("#tabs > div");
    let options = {
      root: document.querySelector("#tabs"),
      rootMargin: "0px",
      threshold: 1,
    };
    function handleObserver(entries: IntersectionObserverEntry[]) {
      entries.map((entry: any) => {
        if (entry.isIntersecting) {
          const targetID = entry.target.id;
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

  return { active, setActive, navigateTab };
}
