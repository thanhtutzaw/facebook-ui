import { useState, useEffect } from "react";
export function useActive() {
  const [active, setActive] = useState("");
  function navigateTab(tab: string) {
    setActive(tab);
    const target = document.getElementById(tab);
    console.log(target);
    target?.scrollIntoView({ behavior: "smooth" });
  }
  useEffect(() => {
    const tabs = document.querySelectorAll("#tabs > div");
    let options = {
      root: document.querySelector("#tabs"),
      rootMargin: "0px",
      threshold: 1,
    };
    function handleObserver(entries: any) {
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
