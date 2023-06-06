import router, { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import useEscape from "../../hooks/useEscape";
import { deleteMultiple } from "../../lib/firestore/post";
import { Props } from "../../types/interfaces";
import BackHeader from "./BackHeader";

function SelectModal() {
  const { uid, selectedId, setSelectedId, selectMode, setselectMode } =
    useContext(AppContext) as Props;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  useEscape(() => {
    if (!selectMode) return;
    setselectMode?.(false);
    setSelectedId?.([]);
  });
  // useEffect(() => {
  //   if (!loading && selectedId?.length !== 0 && selectMode) {
  //     setselectMode?.(false);
  //     setSelectedId?.([]);
  //   }
  // }, [loading, selectMode, selectedId?.length, setSelectedId, setselectMode]);
  useEffect(() => {
    const handleRouteStart = () => {
      console.log("routestart");
    };
    const handleRouteDone = () => {
      // setselectMode?.(false);
      console.log("routedone");
      setSelectedId?.([]);
      // setselectMode?.(false);
    };
    router.events.on("routeChangeStart", handleRouteStart);
    router.events.on("routeChangeComplete", handleRouteDone);
    router.events.on("routeChangeError", handleRouteDone);
    return () => {
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeComplete", handleRouteDone);
      router.events.off("routeChangeError", handleRouteDone);
    };
  }, [router.events, setSelectedId, setselectMode, loading]);

  return (
    <BackHeader
      selectMode={selectMode!}
      onClick={() => {
        // router.back();
        setselectMode?.(false);
        setSelectedId?.([]);
        // window.location.hash = ""
      }}
      style={{
        position: "initial",
        borderBottom: "4px solid rgb(235, 235, 235)",
      }}
    >
      <h2>
        <span>{selectedId?.length}</span> Selected
      </h2>
      <button
        disabled={loading}
        onClick={async () => {
          if (!uid || selectedId?.length === 0 || !selectedId) return;
          setLoading(true);
          console.log("deleting");
          try {
            await deleteMultiple(uid, selectedId);
            setLoading(true);
            // router.replace("/");
            console.log("deleting...");
          } catch (error: any) {
            setLoading(false);
            alert(error.message);
          } finally {
            setLoading(false);
            console.log("deleted");
            setSelectedId?.([]);
            setselectMode?.(false);
            setTimeout(() => {
              router.replace("/");
              router.replace(router.asPath);
              // setLoading(false);
              // setSelectedId?.([]);
              // setselectMode?.(false);
            }, 1000);
            // router.replace(router.asPath);
          }
        }}
        className="deleteBtn"
      >
        {loading ? "Deleting" : "Delete"}
      </button>
    </BackHeader>
  );
}

export default SelectModal;
