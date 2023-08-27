import { useEffect, useRef } from "react";

function useInfiniteScroll(
  fetchMoreData: () => Promise<void>,
  hasMore: boolean,
  scrollParent = false
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleScroll(e: Event) {
      const target = e.currentTarget as HTMLElement;
      const currentScroll = target.scrollTop;
      console.log(target.scrollTop, window.innerHeight);
      if (window.innerHeight + currentScroll + 1 >= target.scrollHeight) {
        console.log({ currentScroll });
        // console.log({ hasMore });
        console.log("fetching more comments");
        fetchMoreData();
      }
      if (hasMore) {
        element.removeEventListener("scroll", handleScroll);
      }
      // if (
      //   window.innerHeight + target.scrollTop + 1 >= target.scrollHeight &&
      //   !hasMore
      // ) {
      //   console.log("fetching more comments");
      //   await fetchMoreData();
      //   // console.log({hasMore, scrollParent});
      // }
    }
    const element = scrollParent
      ? scrollRef.current?.parentElement!
      : scrollRef.current!;
    element.addEventListener("scroll", handleScroll);
    // element.removeEventListener("scroll", handleScroll);
    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [fetchMoreData, hasMore, scrollParent]);
  return { scrollRef };
}

export default useInfiniteScroll;
