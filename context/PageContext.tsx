import { useRef, useState, ReactNode, RefObject } from "react";
import { createContext } from "react";
import { useActive } from "../hooks/useActiveTab";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
// const AppContext = createContext<{ user: User | null }>({ user: null });
export interface PageProps {
  uploadButtonClicked?: boolean;
  setuploadButtonClicked?: Function;
  viewRef?: RefObject<HTMLDialogElement>;
  fileRef?: RefObject<HTMLInputElement>;
  active: string;
  children?: ReactNode;
  setActive: Function;
  showAction?: string;
  selectedId?: string[];
  setSelectedId?: Function;
  setshowAction?: Function;
  uid: DecodedIdToken["uid"];
  preventClick?: boolean;
  setpreventClick?: Function;
}
export const PageContext = createContext<PageProps | null>(null);

export function PageProvider(props: PageProps) {
  const { uid } = props;
  const { active, setActive } = useActive();
  const [showAction, setshowAction] = useState("");
  const [selectedId, setSelectedId] = useState([]);
  const [preventClick, setpreventClick] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const viewRef = useRef<HTMLDialogElement>(null);
  const [uploadButtonClicked, setuploadButtonClicked] = useState(false);
  return (
    <PageContext.Provider
      value={{
        preventClick,
        setpreventClick,

        selectedId,
        setSelectedId,
        uid,
        showAction,
        setshowAction,
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
