import { useState, useEffect } from "react";
export function useActive() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const content = document.querySelectorAll("#content > div");
    let options = {
      root: document.querySelector("#content"),
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
    content.forEach((item) => {
      observer.observe(item);
    });

    return () => {
      content.forEach((item) => {
        observer.unobserve(item);
      });
    };
  }, [active]);

  return { active, setActive };
}
