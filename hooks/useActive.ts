import { useRouter } from "next/router";
import { useState, useEffect } from "react";
export interface IMovieProviderProps {
  active?: string;
  setActive: () => void;
}
function useActive() {
  const [active, setActive] = useState("");
  // const [active, setActive] = useState<IMovieProviderProps | string>("");

  const router = useRouter();
  // const [threshold, setthreshold] = useState(.6)
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
          // console.log(threshold);
          const targetID = entry.target.id;
          // const content = document.getElementById("content");
          // content?.addEventListener('mouseover',()=>{
          //   console.log("drag");
          // })

          setActive(targetID);

          
          // setthreshold(1)
          // window.location.hash = active === "/" ? "#home" : "#" + active;

          // router.push(active)
          // console.log(router);
          // const path = active === '/' ? "#home" : "#"+active

          // console.log(router.asPath);
          // if(targetID === '/'){router.push('#home');}

          // console.log(active);
          // console.log(active);
          // console.log(active);
          // if(active === '/'){
          //   router.push('#home')
          // }
          // console.log(active === '/');
          // if(active === '/') return ;
          // if(active !== '/'){
          //   console.log(active);
          // }
          // console.log(active);

          // router.push('#home').then(()=>{
          //   if(targetID){
          //     router.push('#home')
          //   }
          // })
          // console.log(targetID);
          // router.push("hey")
          // const path = targetID === '/' ? '#home' : "#"+targetID
          // router.push(path).then((hash) => {
          //   if(hash){
          //     router.push(path)
          //   }
          // })
          // targetID === '/' ? router.push("#home"): router.push("#"+targetID)
          // console.log(router.asPath);
          // router.push(targetID).then((hash) => {
          //   if(hash){
          //     targetID === '/' ? router.push("#home"): router.push("#"+targetID)
          //   }
          // })
          // router.push(`${targetID === '/' ? '#home' : "#"+targetID}`);
          // router.push(`${targetID === "/" ? "" : "#"}` + targetID);
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

export default useActive;
