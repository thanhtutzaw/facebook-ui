import { useState, useEffect } from "react";

function useActive() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const content = document.querySelectorAll("#content > div");
    let options = {
      root: document.querySelector("#content"),
      rootMargin: "0px",
      threshold: 0.5,
    };
    function handleObserver(entries: any) {
      entries.map((entry: any) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }

    const observer = new IntersectionObserver(handleObserver, options);
    content.forEach((item) => {
      observer.observe(item);
    });
  }, []);

  return [active];
}

export default useActive;