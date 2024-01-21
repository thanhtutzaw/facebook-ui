import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { Auth, User } from "firebase/auth";
import {
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  createContext,
  useContext,
  useRef,
  useState,
} from "react";
import { Tabs, friends } from "../types/interfaces";

export type selectedPosts = {
  postId: string;
  authorId: string;
  share: {
    postId: string | null;
    authorId: string | null;
  } | null;
};
export interface TsingleImageModal {
  src: string;
  name: string;
}
export interface PageProps {
  queryClient: QueryClient;
  dropdownRef: RefObject<HTMLDivElement>;
  uploadButtonClicked: boolean;
  setuploadButtonClicked: Dispatch<SetStateAction<boolean>>;
  indicatorRef: RefObject<HTMLDivElement>;
  fileRef: RefObject<HTMLInputElement>;
  selectedPosts: selectedPosts[];
  setSelectedId: Dispatch<SetStateAction<selectedPosts[]>>;
  singleImageModalRef: RefObject<HTMLDialogElement>;
  // preventClick2: MutableRefObject<boolean>;
  preventClick: boolean;
  friends: friends[];
  setpreventClick: Function;
  setfriends: Function;
}
interface Props {
  friendReqCount: number;
  active: Tabs;
  setActive: Function;
  currentUser: (User & { photoURL_cropped?: string | undefined }) | null;
  setcurrentUser: Function;
  children: ReactNode;
  auth: Auth;
}
export const PageContext = createContext<(PageProps & Props) | null>(null);

export function PageProvider(props: Props) {
  const [friends, setfriends] = useState<friends[]>([]);
  const queryClient = useQueryClient();
  const [selectedPosts, setSelectedId] = useState<selectedPosts[]>([]);
  const [preventClick, setpreventClick] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const singleImageModalRef = useRef<HTMLDialogElement>(null);
  const [uploadButtonClicked, setuploadButtonClicked] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  return (
    <PageContext.Provider
      value={{
        indicatorRef,
        setfriends,
        friends,
        queryClient,
        dropdownRef,
        preventClick,
        setpreventClick,
        selectedPosts,
        setSelectedId,
        uploadButtonClicked,
        setuploadButtonClicked,
        singleImageModalRef,
        fileRef,
        ...props,
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
