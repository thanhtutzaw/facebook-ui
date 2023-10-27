import { QueryKey } from "@/types/interfaces";
import { useQueryClient } from "@tanstack/react-query";
type Tkey = keyof typeof QueryKey;
function useQueryFn() {
  const query = useQueryClient();
  const getKey = (key: Tkey) => [QueryKey[key]];
  const queryFn = {
    invalidate: (key: Tkey) => query.invalidateQueries(getKey(key)),
    refetchQueries: (key: Tkey) => query.refetchQueries(getKey(key)),
  };
  return { queryFn };
}

export default useQueryFn;
