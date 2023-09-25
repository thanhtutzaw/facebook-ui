import {
  useRef,
  useState,
  ReactNode,
  RefObject,
  useEffect,
  MutableRefObject,
} from "react";
import { createContext } from "react";
import { useQueryClient, QueryClient } from "@tanstack/react-query";
import { User } from "firebase/auth";
import { Post, Tabs, friends } from "../types/interfaces";

export type selectedId = {
  post: string;
  author: string;
  share: {
    post: string | null;
    author: string | null;
  } | null;
};
export interface PageProps {
  newsFeedData?: Post[];
  setnewsFeedData?: Function;
  currentUser: User | null;
  queryClient?: QueryClient;
  postError?: string;
  dropdownRef?: RefObject<HTMLDivElement>;
  uploadButtonClicked?: boolean;
  setuploadButtonClicked?: Function;
  viewRef?: RefObject<HTMLDialogElement>;
  fileRef?: RefObject<HTMLInputElement>;
  active: Tabs;
  children?: ReactNode;
  setActive: Function;
  shareAction?: string;
  showAction?: string;
  selectedId?: selectedId[];
  setSelectedId?: Function;
  setshareAction?: Function;
  setshowAction?: Function;
  view?: any;
  setview?: Function;
  // preventClick?: MutableRefObject<boolean>;
  preventClick?: boolean;
  isPage?: any;
  setnotiPermission?: Function;
  setisPage?: Function;
  friends?: friends[] | [];
  setpreventClick?: Function;
  setfriends?: Function;
}
export const PageContext = createContext<PageProps | null>(null);

export function PageProvider(props: PageProps) {
  const {
    active,
    setActive,
    currentUser,
    isPage,
    setisPage,
    setnotiPermission,
  } = props;
  const [friends, setfriends] = useState<friends[]>([]);
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
  const [newsFeedData, setnewsFeedData] = useState<Post[]>([]);
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
        newsFeedData,
        setnewsFeedData,
        setnotiPermission,
        friends,
        setfriends,
        isPage,
        currentUser,
        setisPage,
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
