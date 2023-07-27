import { Timestamp } from "firebase/firestore";
import { ReactNode, RefObject } from "react";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { User } from "firebase/auth";
export type account = {
  email: string;
  password: string;
  profile: {
    firstName: string | "";
    lastName: string | "";
    bio: string | "";
    photoURL?: string | "";
  };
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
  like?: any;
  author: UserRecord | User;
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
  isLiked: boolean;
  isSaved: boolean;
  shares?: any;
}
export interface Post {
  isSaved: boolean;
  isLiked: boolean;
  like?: any;
  shares?: any;
  sharers?: string[];
  author: UserRecord | User | account["profile"];
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
  updatePost?: Function;
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
  setlimitedPosts?: Function;
  getMorePosts?: Function;
  postLoading?: boolean;
  postEnd?: boolean;
}
