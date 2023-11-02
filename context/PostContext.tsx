import { User } from "firebase/auth";
import {
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  createContext,
} from "react";
import { Post as PostType, likes } from "../types/interfaces";
export type PostProps = {
  Likes: likes;
  updatePost: Function;
  setLikes: Function;
  tabIndex?: number;
  likeCount: number;
  shareMode?: boolean;
  preventNavigate?: boolean;
  selectMode: boolean;
  checked: boolean;
  client: boolean;
  uncheckRef: RefObject<HTMLButtonElement>;
  setChecked: Function;
  checkRef: RefObject<HTMLButtonElement>;
  showmore: boolean;
  setShowmore: Function;
  post: PostType;
  auth: User;
  children: ReactNode;
  toggleMenu: string;
  settoggleMenu: Dispatch<SetStateAction<string>>;
};
export const PostContext = createContext<any | null>(null);
export default function PostProvider(props: PostProps) {
  return (
    <PostContext.Provider value={{ ...props }}>
      {props.children}
    </PostContext.Provider>
  );
}
