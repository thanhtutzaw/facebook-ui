import { Timestamp } from "firebase/firestore";
import { ReactNode, RefObject } from "react";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
export type account = {
  email: string;
  password: string;
  profile: { firstName: string | ""; lastName: string | ""; bio: string | "" };
};
export type Media = {
  name: string;
  url: string;
  type: string;
};
export interface SavedPost {
  id: string | number;
  authorId: string;
  postId: string;
}
export interface sharePost {
  id: string | number;
  author: string;
  postId: string;
}
export interface sharedPost {
  author: UserRecord;
  authorId: string | number;
  id?: string | number;
  text: string;
  visibility: string;
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
export interface Post {
  sharers?: string[];
  author: UserRecord;
  authorId: string | number;
  id?: string | number;
  text: string;
  visibility: string;
  sharePost?: { author: string; id: string; post?: sharedPost | null };
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
  posts?: Post[];
  email?: string | null;
  headerContainerRef?: RefObject<HTMLDivElement>;
  profile?: account["profile"] | null;
  account?: UserRecord | null;
}
