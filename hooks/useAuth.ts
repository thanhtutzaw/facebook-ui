import { AppContext } from "../context/AppContext";
import { useContext } from "react";
import { Props } from "../types/interfaces";

export function useAuth() {
  const user = useContext(AppContext) as Props;
  return { user };
}
