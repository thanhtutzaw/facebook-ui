import { useEffect, useRef } from "react";

function useInfiniteScroll(
  fetchMoreData: Function,
  hasMore: boolean,
  scrollParent = false
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    async function handleScroll(e: Event) {
      const target = e.currentTarget as HTMLElement;
      if (
        window.innerHeight + target.scrollTop + 1 >= target.scrollHeight &&
        !hasMore
      ) {
        await fetchMoreData();
      }
    }
    const element = scrollParent
      ? scrollRef.current?.parentElement!
      : scrollRef.current!;
    element.addEventListener("scroll", handleScroll);
    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [fetchMoreData, hasMore, scrollParent]);
  return { scrollRef };
}

export default useInfiniteScroll;
