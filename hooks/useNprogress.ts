import "@fortawesome/fontawesome-svg-core/styles.css";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";
function useNprogress() {
  const router = useRouter();
  useEffect(() => {
    const handleRouteStart = () => nProgress?.start();
    const handleRouteDone = () => nProgress?.done();
    router.events.on("routeChangeStart", handleRouteStart);
    router.events.on("routeChangeComplete", handleRouteDone);
    router.events.on("routeChangeError", handleRouteDone);
    return () => {
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeComplete", handleRouteDone);
      router.events.off("routeChangeError", handleRouteDone);
    };
  }, [router.events]);
}

export default useNprogress;