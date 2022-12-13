import { useRouter } from "next/router";
import { useState, useEffect } from "react";

function useActive() {
  const [active, setActive] = useState("");

  const router = useRouter();
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

          const targetID = entry.target.id;
          setActive(entry.target.id);
          // router.push(`${targetID === "/" ? "" : "#"}` + targetID);
        }
      });
    }

    const observer = new IntersectionObserver(handleObserver, options);
    content.forEach((item) => {
      observer.observe(item);
    });
  }, []);

  return [active , setActive];
}

export default useActive;