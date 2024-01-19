import { NotiMessageTypes } from "@/lib/firestore/notifications";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { User } from "firebase/auth";
import { FieldValue, Timestamp } from "firebase/firestore";
export const QueryKey = {
  noti: "notifications",
  myPost: "myPost",
  suggestedFriends: "suggestedFriends",
  pendingFriends: "pendingFriends",
};
export interface TAcceptedFriends {
  id: string;
  author: UserRecord;
}
export type timeStamp =
  | {
      seconds: number;
      nanoseconds: number;
    }
  | Timestamp;
export type likes = {
  uid: string | number;
  createdAt: timeStamp;
  author?: UserRecord | User | account["profile"];
};

export type friends = {
  id: string | number;
  status?: "friend" | "block" | "pending";
  createdAt?:FieldValue | timeStamp;
  updatedAt?:FieldValue | timeStamp;
  date?: timeStamp;
  senderId?: string;
  author?: account["profile"] | null;
};

export type account = {
  email: string;
  password: string;
  profile: {
    firstName: string | "";
    lastName: string | "";
    bio: string | "";
    photoURL: string | null | File;
    photoURL_cropped?: string | "";
  };
};
export type author = UserRecord | User | account["profile"] | null;

export type Noti = {
  hasRead: boolean;
  messageBody?: string;
  uid: string;
  message: string;
  userName: string;
  url: string;
  content?: string;
  id?: string | number;
  type: NotiMessageTypes;
  createdAt: timeStamp;
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
  latestCommet: Comment[];
  author: Post["author"];
  authorId: string | number;
  id?: string | number;
  text: string;
  visibility: string;
  createdAt: timeStamp;
  updatedAt: timeStamp;
  media: Media[] | null;
  isLiked: boolean;
  isSaved: boolean;
  comments: Comment[];
  commentCount?: string | number;
  likeCount: string | number;
}
export interface Post {
  recentId?: string;
  deletedByAuthor?: boolean;
  likeCount: string | number;
  commentCount?: string | number;
  isSaved: boolean;
  isLiked: boolean;
  shareCount?: string | number;
  author: author | undefined | {};
  authorId: string | number;
  id?: string | number;
  text: string;
  visibility: string;
  sharePost?: { author: string; id: string; post?: sharedPost | null };
  media: Media[] | null;
  latestCommet: Comment[];
  comments: Comment[];
  createdAt: timeStamp;
  updatedAt: timeStamp;
}
export interface Comment {
  recentRepliesLoading?: boolean;
  recentReplies: Comment[];
  recipient?: {
    id: string;
    author?: { fullName?: string };
  };
  replies: Comment[];
  isLiked: boolean;
  replyCount?: number;
  heartCount?: number;
  author?: author;
  authorId: string | number;
  id?: string | number;
  authorFirstReplyId?: string | number;

  text: string;
  createdAt: timeStamp;
  updatedAt?: timeStamp | FieldValue;
}
export interface RecentPosts {
  id: string;
  recentId: string;
  authorId: string;
  createdAt: Post["createdAt"];
}

export type Tabs =
  | "home"
  | "/"
  | "friends"
  | "watch"
  | "profile"
  | "notifications"
  | "menu";
