import {
  useInfiniteQuery,
  InfiniteData,
  QueryFunction,
  FetchNextPageOptions,
  QueryObserverResult,
  InfiniteQueryObserverResult,
  QueryKey,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";
// type FetchFunction = (pageParam?: any | null)=> Promise<<Awaited<ReturnType<typeof fetch>>>>;
type CustomHookReturnType<Data> = {
  scrollRef: React.RefObject<HTMLDivElement>;
  // fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isLoading: boolean;
  error: unknown;
  // data: QueryObserverResult<ReturnType<FetchFunction>, unknown> | undefined;
  // data: QueryObserverResult<Data, unknown> | undefined;
  data: InfiniteData<Data> | undefined;
  // fetchNextPage: (
  //   options?: FetchNextPageOptions | undefined
  // ) => Promise<InfiniteQueryObserverResult<Data | undefined, unknown>>;
};
// CustomHookReturnType<Data>
function useReactQueryInfiniteScroll<Data>(
  // fetch: (pageParam?: any | null) => Promise<{ data: Data; hasMore: boolean } | any>,
  // fetch: (pageParam?: any | null) => any,
  // fetch : QueryFunction<TQueryFnData, TQueryKey>,
  // fetch: {
  // (pageParam?: any | null): Promise<
  // Awaited<ReturnType<typeof fetch>>
  // >;
  // (arg0: any): any;
  fetch: (pageParam?: any | null) => Promise<Data>,
  key: QueryKey,
  enabled = true,
  scrollParent = false
): Data {
  const { fetchNextPage, hasNextPage, isLoading, error, data } =
    useInfiniteQuery<Data | unknown >({
      queryKey: key,
      queryFn: async ({ pageParam }) => await fetch(pageParam),
      enabled: enabled,
      keepPreviousData: true,
      // getNextPageParam: (lastPage) =>
      //   lastPage?.hasMore
      //     ? lastPage.data![lastPage?.data?.length! - 1]
      //     : undefined,
    });
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    async function handleScroll(e: Event) {
      const target = e.currentTarget as HTMLElement;
      if (window.innerHeight + target.scrollTop + 1 >= target.scrollHeight) {
        if (hasNextPage) {
          fetchNextPage();
        }
      }
    }
    const element = scrollParent
      ? scrollRef.current?.parentElement!
      : scrollRef.current!;
    element.addEventListener("scroll", handleScroll);
    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [fetchNextPage, hasNextPage, scrollParent]);
  return {
    scrollRef,
    hasNextPage,
    isLoading,
    error,
    data,
  } as Data;
}

export default useReactQueryInfiniteScroll;
