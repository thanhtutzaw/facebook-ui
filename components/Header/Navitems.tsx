import useQueryFn from "@/hooks/useQueryFn";
import { useRouter } from "next/router";
import React, { HTMLProps, ReactElement, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import styles from "../../styles/Home.module.scss";
import { AppProps, Tabs } from "../../types/interfaces";

export default function Navitems(props: {
  currentNav: Tabs;
  setCurrentNav: Function;
  active: Tabs;
  setActive: Function;
  name: string;
  index: number;
  children: ReactElement[] | ReactElement;
}) {
  const {
    children,
    currentNav,
    setCurrentNav,
    active,
    setActive,
    name,
    index,
  } = props;
  const { queryFn } = useQueryFn();
  const { headerContainerRef, setUnReadNotiCount } = useContext(
    AppContext
  ) as AppProps;

  const router = useRouter();
  const changeTab = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // if (TabName === "home" || TabName === "/") {
    //   headerContainerRef &&
    //     headerContainerRef.current?.setAttribute("data-hide", "false");
    // }
    const tabs = document.getElementById("tabs")!;
    const tab = document.getElementById(TabName)!;
    setCurrentNav?.(TabName);
    setActive?.(TabName);
    window.location.hash = TabName === "/" ? "#home" : `#${TabName}`;
    if (TabName === active) {
      tab.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      if (tab.scrollTop >= 60) return;
      if (active === "/") {
        // console.log("refreshing new data in Newsfeed");
        router.replace("/", undefined, { scroll: false });
      } else if (active === "friends") {
        router.replace("/#friends", undefined, { scroll: false });
      } else if (TabName === "notifications") {
        setUnReadNotiCount?.(0);
        console.log("reseting Noti Count");
        queryFn.invalidate("noti");
        queryFn.refetchQueries("noti");
      }
      return;
    }
    tabs.scrollTo({
      left: index * tabs.clientWidth,
      behavior: "smooth",
    });
  };
  const TabName = name.toLowerCase() as Tabs;
  const activeClass = currentNav === TabName ? styles.active : "";
  // const title: { [key in Tabs]: string } = {
  //   home: iconTitle,
  //   "/": iconTitle,
  //   friends: iconTitle,
  //   watch: iconTitle,
  //   profile: iconTitle,
  //   menu: iconTitle,
  //   notifications: `${
  //     (notiCount ?? 0) > 0 ? `${iconTitle} (${notiCount})` : iconTitle
  //   }`,
  // };

  return (
    <div
      onClick={changeTab}
      className={`${styles.navItem} relative ${activeClass}  `}
    >
      {/* <Y   iconTitle={iconTitle} TabIcon={TabIcon}  /> */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const ChildClone = React.cloneElement(child, {
            // ...childProps,
          });
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
            const ChildClone = React.cloneElement(child, {
              // ...childProps,
            });
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
Navitems.Container = NavItem;
Navitems.Icon = NavIcon;
Navitems.Badge = NavBadge;
Navitems.BadgeItem = BadgeItem;
Navitems.Indicator = Indicator;
