import { QueryKey } from "@/types/interfaces";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
type Tkey = keyof typeof QueryKey;
function useQueryFn() {
  const query = useQueryClient();
  const getKey = (key: Tkey) => [QueryKey[key]];
  const queryFn = useMemo(() => {
    return {
      invalidate: (key: Tkey) => query.invalidateQueries(getKey(key)),
      refetchQueries: (key: Tkey) => query.refetchQueries(getKey(key)),
    };
  }, [query]);
  // return { queryFn: ref.current as typeof queryFn };
  return { queryFn };
}

export default useQueryFn;
