import { Timestamp } from "firebase/firestore";
import { ReactNode, RefObject } from "react";
import { account } from "../pages/login";
export type Media = {
  name: string;
  url: string;
  type: string;
};

export interface Post {
  authorId: string | number;
  id?: string | number;
  text: string;
  visibility: string;
  // createdAt: number | string | { seconds: number; nanoseconds: number };
  // updatedAt: number | string | { seconds: number; nanoseconds: number };
  createdAt:
    | {
        seconds: number;
        nanoseconds: number;
      }
    | Timestamp;
  updatedAt:
    | {
        seconds: number;
        nanoseconds: number;
      }
    | Timestamp;
  media: Media[] | null;
}

export interface Props {
  username?: string;
  selectedId?: string[];
  setSelectedId?: Function;
  children?: ReactNode;
  showAction?: string;
  setselectMode?: Function;
  selectMode?: boolean;
  setshowAction?: Function;
  preventClick?: boolean;
  setpreventClick?: Function;
  expired?: boolean;
  uid?: string;
  active?: string;
  setActive?: Function;
  allUsers?: any;
  sortedPost?: Post[];
  setsortedPost?: Function;
  myPost?: Post[];
  posts?: Post[];
  email?: string | null;
  headerContainerRef?: RefObject<HTMLDivElement>;
  indicatorRef?: RefObject<HTMLDivElement>;
  profile?: account["profile"] | null;
}
