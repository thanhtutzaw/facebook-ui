import { useEffect, useRef } from "react";
/**
 * A hook that listen scroll event for InfiniteScroll (Client)
 * @param [scrollParent=false]
 * @param fetchMoreData
 * @param hasMore
 */
export default function useInfiniteScroll(
  hasMore: boolean,
  scrollParent = false,
  fetchMoreData?: () => Promise<void>,
  postEnd = false
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleScroll(e: Event) {
      const target = e.currentTarget as HTMLElement;
      const currentScroll = target.scrollTop;
      if (window.innerHeight + currentScroll + 1 >= target.scrollHeight) {
        if (hasMore) {
          fetchMoreData?.();
        }
      }
      if (postEnd) {
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
  }, [fetchMoreData, hasMore, postEnd, scrollParent]);
  return { scrollRef };
}
