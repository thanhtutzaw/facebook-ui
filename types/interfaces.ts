export interface Post {
  authorId?: string | number;
  id?: string | number;
  text: string;
  visibility?: string;
  // visibility?: ["public", "friends", "onlyme"];
  createdAt: Timestamp;
  media:
    | {
        name: string;
        url: string;
      }[]
    | null;
}
import { Timestamp } from "firebase/firestore";
import { ReactNode } from "react";
export interface Props {
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
  headerContainerRef?: React.RefObject<HTMLDivElement>;
  indicatorRef?: React.RefObject<HTMLDivElement>;
}
