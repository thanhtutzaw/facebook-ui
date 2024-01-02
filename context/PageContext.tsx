import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { User } from "firebase/auth";
import {
  ReactNode,
  RefObject,
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
interface singleImageModalType {
  src: string;
  name: string;
}
export interface PageProps {
  friendReqCount: number;
  newsFeedData?: Post[];
  setnewsFeedData: Function;
  currentUser: (User & { photoURL_cropped?: string }) | null;
  queryClient?: QueryClient;
  postError?: string;
  dropdownRef?: RefObject<HTMLDivElement>;
  uploadButtonClicked?: boolean;
  setuploadButtonClicked?: Function;
  indicatorRef: RefObject<HTMLDivElement>;
  fileRef?: RefObject<HTMLInputElement>;
  active: Tabs;
  children?: ReactNode;
  setActive: Function;
  shareAction?: string;
  selectedId?: selectedId[];
  setSelectedId?: Function;
  setshareAction?: Function;
  setcurrentUser: Function;
  singleImageModalRef?: RefObject<HTMLDialogElement>;
  singleImageModal?: singleImageModalType;
  setsingleImageModal?: Function;
  // preventClick?: MutableRefObject<boolean>;
  preventClick?: boolean;
  friends?: friends[];
  setpreventClick?: Function;
  setfriends?: Function;
}
interface PropsType {
  friendReqCount: number;
  active: Tabs;
  setActive: Function;
  currentUser: (User & { photoURL_cropped?: string }) | null;
  setcurrentUser: Function;
  children: ReactNode;
}
export const PageContext = createContext<PageProps | null>(null);
// const PostContext = createContext<PostPageProps | null>(null);

export function PageProvider(props: PropsType) {
  const [friends, setfriends] = useState<friends[]>([]);
  const queryClient = useQueryClient();
  const [shareAction, setshareAction] = useState("");
  const [selectedId, setSelectedId] = useState([]);
  const [preventClick, setpreventClick] = useState(false);
  const [singleImageModal, setsingleImageModal] =
    useState<singleImageModalType>({
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
        ...props,
        setnewsFeedData,
      }}
    >
      {props.children}
    </PageContext.Provider>
  );
}
export const usePageContext = () => {
  const context = useContext(PageContext);
  if (!context) throw Error("PageContext should use within PageProvider");

  return context;
};
