import { PageContext, PageProps } from "@/context/PageContext";
import useQueryFn from "@/hooks/useQueryFn";
import { useRouter } from "next/router";
import React, {
  HTMLProps,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppContext } from "../../context/AppContext";
import styles from "../../styles/Home.module.scss";
import { AppProps, Tabs } from "../../types/interfaces";

export default function Navitems(props: {
  width: number | undefined;
  currentNav: Tabs;
  setCurrentNav: Function;
  active: Tabs;
  setActive: Function;
  icon: JSX.Element;
  name: string;
  index: number;
}) {
  const { queryFn } = useQueryFn();
  const { headerContainerRef, UnReadNotiCount, setUnReadNotiCount } =
    useContext(AppContext) as AppProps;
  const { friendReqCount } = useContext(PageContext) as PageProps;
  const [notiCount, setNotiCount] = useState(UnReadNotiCount);
  useEffect(() => {
    setNotiCount(UnReadNotiCount);
  }, [UnReadNotiCount]);
  const {
    width,
    currentNav,
    setCurrentNav,
    active,
    setActive,
    icon: TabIcon,
    name,
    index,
  } = props;
  const router = useRouter();
  let iconTitle = name === "/" ? "Home" : name;
  const TabName = name.toLowerCase() as Tabs;
  const changeTab = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (TabName === "home" || TabName === "/") {
      headerContainerRef &&
        headerContainerRef.current?.setAttribute("data-hide", "false");
    }
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
        console.log("refreshing new data in Newsfeed");
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
  const activeClass = currentNav === TabName ? styles.active : "";
  const title: { [key in Tabs]: string } = {
    home: iconTitle,
    "/": iconTitle,
    friends: iconTitle,
    watch: iconTitle,
    profile: iconTitle,
    menu: iconTitle,
    notifications: `${
      (notiCount ?? 0) > 0 ? `${iconTitle} (${notiCount})` : iconTitle
    }`,
  };
  const badge = {
    home: null,
    "/": null,
    friends: <BadgeItem count={friendReqCount} />,
    watch: null,
    profile: null,
    menu: null,
    notifications: active !== "notifications" && (
      <BadgeItem count={notiCount} />
    ),
  };
  return (
    <div
      onClick={changeTab}
      className={`${styles.navItem} relative ${activeClass}  `}
    >
      <NavItem aria-label={iconTitle} title={title[TabName]}>
        <NavIcon>{TabIcon}</NavIcon>
        <NavBadge>{badge[TabName]}</NavBadge>
      </NavItem>
      {currentNav === TabName && !width && <Indicator />}
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

function NavItem({
  children,
  ...rest
}: { children: ReactElement[] } & HTMLProps<HTMLDivElement>) {
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
