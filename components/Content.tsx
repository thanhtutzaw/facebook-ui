import Friend from "../pages/friend";
import styles from "../styles/Home.module.css";
import { Story, Posts } from "../pages/index";
import Profile from "../pages/profile";
import Watch from "../pages/watch";
import Menu from "../pages/menu";
import Noti from "../pages/noti";
import { MouseEvent, useEffect, useState } from "react";

export function Content() {
  const [canDrag, setcanDrag] = useState(false)
  const [pos, setpos] = useState({ top: 0, left: 0, x: 0, y: 0 })
  useEffect(() => {
    window.addEventListener('mouseup', ()=>{
      setcanDrag(false)
    })
    // document.body.addEventListener('mousemove',(e)=>{
    //   setcanDrag(false)
    // })
  }, [])
  

  // function handleClick(e: MouseEvent<HTMLDivElement, MouseEvent>) {
  //   e.stopPropagation();
  //   const target = e.target as HTMLDivElement;
  //   if(target.id === 'content'){
  //     console.log(target);
  //   }
  // }

  // function mouseMoveHandle(): EventListenerOrEventListenerObject | null {
  //   return (e: any) => {
  //     console.log("mouse moving");
  //     const currentTarget = e.currentTarget as HTMLDivElement;
  //     const dx = e.clientX - pos.x;
  //     const dy = e.clientY - pos.y;

  //     currentTarget.scrollLeft = pos.left - dx;
  //     // currentTarget.scrollTop = pos.top - dy;
  //   };
  // }

  // function handle(e:any){
  //   const currentTarget = e.currentTarget;
  //   // currentTarget.preventDefault()
  //   // console.log(e.target)
  //   e.preventDefault()
  //   if(e.type === "mousedown"){
  //     console.log("mouse down");
      
  //     e.currentTarget.style.cursor = "grabbing";
  //     currentTarget.style.userSelect = "none";
  //     pos = {
  //         left: currentTarget.scrollLeft,
  //         top: currentTarget.scrollTop,
  //         x: e.clientX,
  //         y: e.clientY,
  //       };
  //       // if (e.type === "mousedown" && e.type === "mousemove") {
  //       // }
  //       // currentTarget.addEventListener("mouseup", handle);
  //       // currentTarget.addEventListener("mousemove", mouseMoveHandle());
  //       // currentTarget.addEventListener("mousemove", mouseMoveHandle());
  //     }else if(e.type === 'mouseup'){
  //       // currentTarget.removeEventListener("mousemove", mouseMoveHandle());
  //     console.log("mouse up");
  //           // currentTarget.style.cursor = "grab";
  //   }
  // }

  function dragStart(e:any){
    
    e.preventDefault()
    e.stopPropagation();
    // console.log(e.currentTarget);
    const currentTarget = e.currentTarget
    console.log(currentTarget);
    setpos({
      left: currentTarget.scrollLeft,
      top: currentTarget.scrollTop,
      x: e.clientX,
      y: e.clientY,
    });
    setcanDrag(true)
    // console.log(pos.x);
      currentTarget.style.cursor = "grabbing";
    // document.body.style.userSelect = 'none'
  }
  function dragStop(e:any){
    e.preventDefault()
    e.stopPropagation();
    // console.log(e.currentTarget);
    const currentTarget = e.currentTarget
    if(canDrag){
      currentTarget.style.cursor = "grab";
    }
    setcanDrag(false)
  }
  function dragging(e: any) {
    if(canDrag === true){
    e.stopPropagation();
      e.preventDefault()
      const currentTarget = e.currentTarget as HTMLDivElement;
      console.log("moving")
      // console.log(pos.x)
      
      const dx = e.clientX - pos.x;
      const dy = e.clientY - pos.y;
      currentTarget.scrollLeft = pos.left - dx;
      // currentTarget.scrollTop = pos.top - dx;
    }else{
      setcanDrag(false)
    }
  }

  return (
    <div
      id="content"
      className={styles.content}
      // onMouseUp={(e)=>{
      //   function mouseUpHandle(): EventListenerOrEventListenerObject | null {
      //     return (e: any) => {
      //       console.log("mouse up");
      //       const currentTarget = e.currentTarget;
      //       currentTarget.style.cursor = "grab";
      //       // const currentTarget = e.currentTarget as HTMLDivElement;

      //       // currentTarget.removeEventListener("mousemove", mouseMoveHandle());
      //       // currentTarget.removeEventListener("mouseup", mouseUpHandle());
      //     };
      //   }
      //   mouseUpHandle();
      // }}
      // onMouseUp={(e) => {
      //   console.log("mouse uppppp");
      //   console.log(e.currentTarget)
      //   // e.currentTarget.removeEventListener("mousemove", mouseMoveHandle());
      //   e.currentTarget.removeEventListener("mousemove", mouseMoveHandle());
      // }}
      onMouseDown={dragStart}
      onMouseUp={dragStop}
      onMouseMove={dragging}

      // onMouseUp={(e)=>{e.currentTarget.scrollLeft=3000}}
      // onMouseUp={(e)=>{e.currentTarget.scrollLeft=3000}}
    >
      <div className={styles.home}>
        <Story />
        <Posts />
      </div>
      <Friend />
      <Profile />
      <Watch />
      <Noti />
      <Menu />
    </div>
  );

  
}
