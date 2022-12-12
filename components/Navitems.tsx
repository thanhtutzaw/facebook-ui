import styles from "../styles/Home.module.css";
import useActive from "../hooks/useActive";

export function Navitems(props: any) {
  const { icon, name, index } = props;
  const targetName = name.toLowerCase();
  const [active] = useActive();
  const isActive = active === targetName ? styles.active : "";
  function handleClick(e: any) {
    const content = document.getElementById("content");
    content?.scrollTo({
      left: index * content.clientWidth,
      behavior: "smooth",
    });
  }
  return (
    <>
      <div onClick={handleClick} className={`${styles.navItems} ${isActive} `}>
        {icon}
      </div>
    </>
  );
}