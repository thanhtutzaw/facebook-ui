import { useInfiniteQuery } from "@tanstack/react-query";
function useReactQueryInfiniteScroll(
  fetch: {
    (pageParam?: any | null): Promise<
      { data: any; hasMore: boolean } | undefined
    >;
    (arg0: any): any;
  },
  enabled?: boolean
) {
  const { fetchNextPage, hasNextPage, isLoading, error, data } =
    useInfiniteQuery({
      queryKey: ["notifications"],
      queryFn: async ({ pageParam }) => await fetch(pageParam),
      enabled: enabled ?? true,
      keepPreviousData: true,
      getNextPageParam: (lastPage) =>
        lastPage?.hasMore
          ? lastPage.data![lastPage?.data.length! - 1]
          : undefined,
    });
  return {
    fetchNextPage,
    hasNextPage,
    isLoading,
    error,
    data,
  };
}

export default useReactQueryInfiniteScroll;
