import { Timestamp } from "firebase/firestore";
import { ReactNode, RefObject } from "react";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { User } from "firebase/auth";
export type likes = {
  uid: string | number;
  createdAt:
    | {
        seconds: number;
        nanoseconds: number;
      }
    | Timestamp;
  author?: UserRecord | User | account["profile"];
}[];
export type account = {
  email: string;
  password: string;
  profile: {
    firstName: string | "";
    lastName: string | "";
    bio: string | "";
    photoURL: string | "" | File;
  };
};
export type notiContentTypes = "post_reaction" | "comment" | "share";

export type NotiTypes = {
  uid: string;
  message: string;
  userName: string;
  url: string;
  content?: string;
  id?: string | number;
  type: notiContentTypes;
  createdAt:
    | {
        seconds: number;
        nanoseconds: number;
      }
    | Timestamp;
  photoURL: string;
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
  comments: Comment[];
  commentCount?: string | number;
  likeCount: string | number;
}
export interface Post {
  likeCount: string | number;
  commentCount?: string | number;
  isSaved: boolean;
  isLiked: boolean;
  like?: any;
  shares?: { uid: string }[];
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
  comments: Comment[];
}
export interface Comment {
  isLiked?: boolean;
  like?: any;
  author?: UserRecord | User | account["profile"];
  authorId: string | number;
  id?: string | number;
  text: string;
  createdAt:
    | {
        seconds: number;
        nanoseconds: number;
      }
    | Timestamp;
  updatedAt?:
    | {
        seconds: number;
        nanoseconds: number;
      }
    | Timestamp;
}

export interface Props {
  postError?: string;
  setlimitedPosts?: Function;
  limitedPosts?: Post[];
  updatePost?: Function;
  username?: string;
  children?: ReactNode;
  setselectMode?: Function;
  selectMode?: boolean;

  expired?: boolean;
  uid?: string;
  active?:
    | "home"
    | "/"
    | "friends"
    | "watch"
    | "profile"
    | "notifications"
    | "menu";
  setActive?: Function;
  allUsers?: any;
  sortedPost?: Post[];
  setsortedPost?: Function;
  posts?: Post[];
  email?: string | null;
  headerContainerRef?: RefObject<HTMLDivElement>;
  profile?: account["profile"] | null;
  account?: UserRecord | null;
  getMorePosts?: Function;
  postLoading?: boolean;
  postEnd?: boolean;
}
