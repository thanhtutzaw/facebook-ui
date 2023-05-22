export interface Post {
  authorId?: string | number;
  id?: string | number;
  text: string;
}
import { ReactNode } from "react";
export interface Props {
  children?: ReactNode;
  uid?: string;
  active?: string;
  setActive?: Function;
  allUsers?: any;
  myPost?: Post[];
  posts?: Post[];
  email?: string | null;
  indicatorRef?: React.RefObject<HTMLDivElement>;
}
