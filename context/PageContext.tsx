import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { User } from "firebase/auth";
import {
  ReactNode,
  RefObject,
  createContext,
  useEffect,
  useRef,
  useState
} from "react";
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
  notiPermission: boolean;
  friendReqCount: number;
  newsFeedData?: Post[];
  setnewsFeedData?: Function;
  currentUser: (User & { photoURL_cropped?: string }) | null;
  queryClient?: QueryClient;
  postError?: string;
  dropdownRef?: RefObject<HTMLDivElement>;
  uploadButtonClicked?: boolean;
  setuploadButtonClicked?: Function;
  viewRef?: RefObject<HTMLDialogElement>;
  indicatorRef?: RefObject<HTMLDivElement>;
  fileRef?: RefObject<HTMLInputElement>;
  active: Tabs;
  children?: ReactNode;
  setActive: Function;
  shareAction?: string;
  selectedId?: selectedId[];
  setSelectedId?: Function;
  setshareAction?: Function;
  view?: any;
  setcurrentUser: Function;
  setview?: Function;
  // preventClick?: MutableRefObject<boolean>;
  preventClick?: boolean;
  setnotiPermission?: Function;
  friends?: friends[] | [];
  setpreventClick?: Function;
  setfriends?: Function;
}
export const PageContext = createContext<PageProps | null>(null);

export function PageProvider(props: PageProps) {
  const {
    ...rest
  } = props;
  const [friends, setfriends] = useState<friends[]>([]);
  const queryClient = useQueryClient();
  const [shareAction, setshareAction] = useState("");
  const [selectedId, setSelectedId] = useState([]);
  const [preventClick, setpreventClick] = useState(false);
  const [view, setview] = useState({ src: "", name: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const viewRef = useRef<HTMLDialogElement>(null);
  const [uploadButtonClicked, setuploadButtonClicked] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

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
        indicatorRef,
        // friendReqCount,
        // setcurrentUser,
        newsFeedData,
        setnewsFeedData,
        // notiPermission,
        // setnotiPermission,
        friends,
        setfriends,
        // currentUser,
        queryClient,
        dropdownRef,
        preventClick,
        setpreventClick,
        view,
        setview,
        selectedId,
        setSelectedId,
        shareAction,
        setshareAction,
        uploadButtonClicked,
        setuploadButtonClicked,
        viewRef,
        fileRef,
        // active,
        // setActive,
        ...props,
      }}
    >
      {props.children}
    </PageContext.Provider>
  );
}
