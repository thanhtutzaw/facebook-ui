import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
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
import { Post, Tabs, account } from "../types/interfaces";
interface Props {
  setprofileSrc: Dispatch<SetStateAction<string>>;
  profileSrc: string;
  token: DecodedIdToken | null;
  uid: string;
  active: Tabs;
  profile: account["profile"] | null;
  children: ReactNode;
}
interface AppContextType {
  UnReadNotiCount: number;
  children: ReactNode;
  setselectMode: Dispatch<SetStateAction<boolean>>;
  selectMode: boolean;
  sortedPost?: Post[];
  setUnReadNotiCount: Dispatch<SetStateAction<number>>;
  setsortedPost: Dispatch<SetStateAction<Post[]>>;
  headerContainerRef: RefObject<HTMLDivElement>;
}
export const AppContext = createContext<(AppContextType & Props) | null>(null);
export function AppProvider(props: Props) {
  const [UnReadNotiCount, setUnReadNotiCount] = useState(0);
  const [selectMode, setselectMode] = useState(false);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const [sortedPost, setsortedPost] = useState<Post[]>([]);

  return (
    <AppContext.Provider
      value={{
        setUnReadNotiCount,
        UnReadNotiCount,
        sortedPost,
        setsortedPost,
        headerContainerRef,
        selectMode,
        setselectMode,
        ...props,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext should use within AppProvider");

  return context;
};
