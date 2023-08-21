import { useRef, useState, ReactNode, RefObject, useEffect } from "react";
import { createContext } from "react";
import { useActive } from "../hooks/useActiveTab";
import { useQueryClient, QueryClient } from "@tanstack/react-query";

import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
// const AppContext = createContext<{ user: User | null }>({ user: null });
export type selectedId = {
  post: string;
  author: string;
  share: {
    post: string | null;
    author: string | null;
  } | null;
};
export interface PageProps {
  queryClient?: QueryClient;
  postError?: string;
  dropdownRef?: RefObject<HTMLDivElement>;
  uploadButtonClicked?: boolean;
  setuploadButtonClicked?: Function;
  viewRef?: RefObject<HTMLDialogElement>;
  fileRef?: RefObject<HTMLInputElement>;
  active: string;
  children?: ReactNode;
  setActive: Function;
  shareAction?: string;
  showAction?: string;
  selectedId?: selectedId[];
  setSelectedId?: Function;
  setshareAction?: Function;
  setshowAction?: Function;
  // uid: DecodedIdToken["uid"];
  preventClick?: boolean;
  view?: any;
  setview?: Function;
  setpreventClick?: Function;
}
export const PageContext = createContext<PageProps | null>(null);

export function PageProvider(props: PageProps) {
  const { active, setActive } = props;
  const queryClient = useQueryClient();
  const [showAction, setshowAction] = useState("");
  const [shareAction, setshareAction] = useState("");
  const [selectedId, setSelectedId] = useState([]);
  const [preventClick, setpreventClick] = useState(false);
  const [view, setview] = useState({ src: "", name: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const viewRef = useRef<HTMLDialogElement>(null);
  const [uploadButtonClicked, setuploadButtonClicked] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: { target: any }) {
      if (!shareAction) return;
      if (dropdownRef?.current?.contains(e.target)) return;
      setshareAction?.("");
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [shareAction]);
  return (
    <PageContext.Provider
      value={{
        queryClient,
        dropdownRef,
        preventClick,
        setpreventClick,
        view,
        setview,
        selectedId,
        setSelectedId,
        shareAction,
        showAction,
        setshowAction,
        setshareAction,
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
