import { useState, useEffect } from "react";
export function useActive() {
  const [active, setActive] = useState("");
  function navigateTab(targetTab: string) {
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
