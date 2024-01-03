import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { Auth, User } from "firebase/auth";
import {
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
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
interface TsingleImageModal {
  src: string;
  name: string;
}
export interface PageProps {
  newsFeedData: Post[];
  setnewsFeedData: Function;
  queryClient: QueryClient;
  dropdownRef: RefObject<HTMLDivElement>;
  uploadButtonClicked: boolean;
  setuploadButtonClicked: Dispatch<SetStateAction<boolean>>;
  indicatorRef: RefObject<HTMLDivElement>;
  fileRef: RefObject<HTMLInputElement>;
  children: ReactNode;
  shareAction: string;
  selectedId: selectedId[];
  setSelectedId: Function;
  setshareAction: Function;
  singleImageModalRef: RefObject<HTMLDialogElement>;
  singleImageModal: TsingleImageModal;
  setsingleImageModal: Function;
  // preventClick: MutableRefObject<boolean>;
  preventClick: boolean;
  friends: friends[];
  setpreventClick: Function;
  setfriends: Function;
}
interface PropsType {
  friendReqCount: number;
  active: Tabs;
  setActive: Function;
  currentUser:
    | (User & { photoURL_cropped?: string | undefined })
    | null;
  setcurrentUser: Function;
  children: ReactNode;
  auth: Auth;
}
export const PageContext = createContext<PageProps & PropsType | null>(null);

export function PageProvider(props: PropsType) {
  const [friends, setfriends] = useState<friends[]>([]);
  const queryClient = useQueryClient();
  const [shareAction, setshareAction] = useState("");
  const [selectedId, setSelectedId] = useState([]);
  const [preventClick, setpreventClick] = useState(false);
  const [singleImageModal, setsingleImageModal] =
    useState<TsingleImageModal>({
      src: "",
      name: "",
    });
  const fileRef = useRef<HTMLInputElement>(null);
  const singleImageModalRef = useRef<HTMLDialogElement>(null);
  const [uploadButtonClicked, setuploadButtonClicked] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const [newsFeedData, setnewsFeedData] = useState<Post[]>([]);
  // console.log("running in pageContext");
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!shareAction) return;
      const target = e.target as HTMLDivElement;
      // console.log(dropdownRef.current);
      if (dropdownRef && !dropdownRef.current?.contains(target)) {
        setshareAction("");
      }
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
        newsFeedData,
        setfriends,
        friends,
        queryClient,
        dropdownRef,
        preventClick,
        setpreventClick,
        singleImageModal,
        setsingleImageModal,
        selectedId,
        setSelectedId,
        shareAction,
        setshareAction,
        uploadButtonClicked,
        setuploadButtonClicked,
        singleImageModalRef,
        fileRef,
        setnewsFeedData,
        ...props,
//         friendReqCount:props.friendReqCount,
// active:props.active,
// setActive:props.setActive,
// currentUser:props.currentUser,
// setcurrentUser:props.setcurrentUser,
// auth:props.auth,
      }}
    >
      {props.children}
    </PageContext.Provider>
  );
}
export const usePageContext = () => {
  const context = useContext(PageContext);
  if (!context) throw new Error("PageContext should use within PageProvider");

  return context;
};
