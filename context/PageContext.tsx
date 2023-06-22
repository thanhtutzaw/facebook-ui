import { useRef, useState, useEffect, ReactNode, RefObject } from "react";
import { createContext } from "react";
import { useActive } from "../hooks/useActiveTab";
import { useRouter } from "next/router";
// const AppContext = createContext<{ user: User | null }>({ user: null });
export interface PageProps {
  viewRef?: RefObject<HTMLDialogElement>;
  fileRef?: RefObject<HTMLInputElement>;
  active: string;
  children?: ReactNode;
  setActive: Function;
}
export const PageContext = createContext<PageProps | null>(null);

export function PageProvider(props: PageProps) {
  //   const { active, setActive } = useState;
  //   const [active, setActive] = useState("I am global");
  const { active, setActive } = useActive();
  const fileRef = useRef<HTMLInputElement>(null);
  const viewRef = useRef<HTMLDialogElement>(null);

  return (
    <PageContext.Provider
      value={{
        viewRef,
        fileRef,
        active,
        setActive,
      }}
    >
      {props.children}
    </PageContext.Provider>
  );
}
