import { useRef, useState, ReactNode, RefObject } from "react";
import { createContext } from "react";
import { useActive } from "../hooks/useActiveTab";
// const AppContext = createContext<{ user: User | null }>({ user: null });
export interface PageProps {
  uploadButtonClicked?: boolean;
  setuploadButtonClicked?: Function;
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
  const [uploadButtonClicked, setuploadButtonClicked] = useState(false);
  return (
    <PageContext.Provider
      value={{
        uploadButtonClicked,
        setuploadButtonClicked,
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
