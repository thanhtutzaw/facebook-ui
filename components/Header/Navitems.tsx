import React, { HTMLProps, ReactElement } from "react";
import styles from "../../styles/Home.module.scss";
import { Tabs } from "../../types/interfaces";

export default function Navitems({
  currentNav,
  name,
  children,
  ...rest
}: {
  name: string;
  currentNav: Tabs;
  children: ReactElement[] | ReactElement | Element;
} & HTMLProps<HTMLDivElement>) {
  // const { children, currentNav, name, rest } = props;

  const TabName = name.toLowerCase() as Tabs;
  const activeClass = currentNav === TabName ? styles.active : "";
  return (
    <div {...rest} className={`${styles.navItem} relative ${activeClass}  `}>
      {React.Children.map(children, (child) => {
        if (!child) return <></>;
        if (React.isValidElement(child)) {
          const ChildClone = React.cloneElement(child, {});
          return ChildClone;
        }
      })}
    </div>
  );
}

function Indicator({}) {
  return (
    <div
      style={{
        bottom: "-1px",
        position: "absolute",
        height: "3px",
        width: "100%",
        zIndex: "100",
        backgroundColor: "var(--blue-origin)",
        borderRadius: "10px",
      }}
      className={styles.indicator}
    ></div>
  );
}

export function NavItem({
  children,
  ...rest
}: { children?: ReactElement[] } & HTMLProps<HTMLDivElement>) {
  return (
    <div role="button" {...rest}>
      <div
        style={{
          position: "relative",
        }}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const ChildClone = React.cloneElement(child, {});
            return ChildClone;
          }
        })}
      </div>
    </div>
  );
}
function NavIcon({ children }: { children: ReactElement }) {
  return <>{children}</>;
}
function NavBadge({ children }: { children: false | ReactElement | null }) {
  return <>{children}</>;
}
function BadgeItem({ count }: { count: number | string | undefined }) {
  const badgeCount =
    typeof count === "string" ? parseInt(count ?? "0") : count ?? 0;

  if (badgeCount <= 0) return null;
  return (
    <span className={styles.badge}>
      {Math.min(badgeCount, 9)}
      {badgeCount > 9 && "+"}
    </span>
  );
}
Navitems.Item = NavItem;
Navitems.Icon = NavIcon;
Navitems.Badge = NavBadge;
Navitems.BadgeItem = BadgeItem;
Navitems.Indicator = Indicator;
