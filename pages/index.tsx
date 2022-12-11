import styles from "../styles/Home.module.css";
import { Content } from "../components/Content";
import { useEffect } from "react";

export function Story() {
  return <div className={styles.storyContainer}>Story</div>;
}
export function Posts() {
  return <div className={styles.postContainer}>Posts</div>;
}

export default function Home() {
  useEffect(() => {
    // const target = e.target as HTMLDivElement;
    const nav = document.getElementsByTagName("nav")[0];
    const main = document.getElementsByTagName('main')[0] 
    
    main.addEventListener('scroll' , handleScroll)
    function handleScroll(){
      console.log(main.scrollTop);
      if (main.scrollTop > 60) {
        nav.classList.add(styles.sticky);
        main.style.scrollSnapType = ''
      } else{
        nav.classList.remove(styles.sticky);
        main.style.scrollSnapType = 'y mandatory'
      }
      
    }
    
    return () => window.removeEventListener('scroll' , handleScroll)

  }, [])
  
  return (
    <>
      <Content />
    </>
  );
}

