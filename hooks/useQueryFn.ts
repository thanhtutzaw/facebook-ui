import { QueryKey } from "@/types/interfaces";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
type Tkey = keyof typeof QueryKey;
function useQueryFn() {
  const query = useQueryClient();
  const getKey = (key: Tkey) => [QueryKey[key]];
  const ref = useRef<any>(null)
  const queryFn = {
    invalidate: (key: Tkey) => query.invalidateQueries(getKey(key)),
    refetchQueries: (key: Tkey) => query.refetchQueries(getKey(key)),
  };
  // getKey("myPost",()=>{})
  ref.current = queryFn 
  return { queryFn: ref.current as typeof queryFn };
}

export default useQueryFn;
