import { useEffect, useRef } from "react";

function useInfiniteScroll(
  hasMore: boolean,
  scrollParent = false,
  fetchMoreData?: () => Promise<void>,
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleScroll(e: Event) {
      const target = e.currentTarget as HTMLElement;
      const currentScroll = target.scrollTop;
      if (window.innerHeight + currentScroll + 1 >= target.scrollHeight) {
        fetchMoreData?.();
      }
      if (hasMore ) {
        element.removeEventListener("scroll", handleScroll);
      }
    }
    const element = scrollParent
      ? scrollRef.current?.parentElement!
      : scrollRef.current!;
    element?.addEventListener("scroll", handleScroll);
    return () => {
      element?.removeEventListener("scroll", handleScroll);
    };
  }, [fetchMoreData, hasMore, scrollParent]);
  return { scrollRef };
}

export default useInfiniteScroll;
