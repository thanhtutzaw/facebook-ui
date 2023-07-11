import { Timestamp } from "firebase/firestore";
import { ReactNode, RefObject } from "react";
import { account } from "../pages/login";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
export type Media = {
  name: string;
  url: string;
  type: string;
};
// export type Author = {
//   name?: string;
//   photoURL?: string;
// };

export interface Post {
  // authorName?: string;
  author: UserRecord;
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

  children?: ReactNode;
  setselectMode?: Function;
  selectMode?: boolean;

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
