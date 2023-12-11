import useQueryFn from "@/hooks/useQueryFn";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { PageContext, PageProps } from "../../context/PageContext";
import useEscape from "../../hooks/useEscape";
import { deleteMultiplePost } from "../../lib/firestore/post";
import s from "../../styles/Home.module.scss";
import { AppProps } from "../../types/interfaces";
import BackHeader from "./BackHeader";
function SelectModal() {
  const { deletePost, uid, selectMode, setselectMode } = useContext(
    AppContext
  ) as AppProps;
  const { selectedId, setSelectedId } = useContext(PageContext) as PageProps;

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  useEscape(() => {
    if (!selectMode) return;
    setselectMode?.(false);
    setSelectedId?.([]);
  });
  useEffect(() => {
    const handleRouteStart = () => {};
    const handleRouteDone = () => {
      setSelectedId?.([]);
      setselectMode?.(false);
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
  const { queryFn } = useQueryFn();
  return (
    <BackHeader
      selectMode={selectMode!}
      onClick={() => {
        setselectMode?.(false);
        setSelectedId?.([]);
      }}
      style={{
        position: "initial",
        borderBottom: "4px solid rgb(235, 235, 235)",
      }}
    >
      <h2 className={s.title}>
        <span>{selectedId?.length}</span> Selected
      </h2>
      <button
        draggable="false"
        disabled={loading || selectedId?.length === 0}
        onClick={async () => {
          if (!uid || selectedId?.length === 0 || !selectedId) return;
          setLoading(true);
          try {
            await deleteMultiplePost(uid, selectedId);
            queryFn.refetchQueries("myPost");
            queryFn.invalidate("myPost");

            setLoading(false);
            setSelectedId?.([]);
            setselectMode?.(false);
            selectedId.map((s) => {
              deletePost?.(s.post);
            });
          } catch (error: unknown) {
            setLoading(false);
            alert(error);
          } finally {
            setSelectedId?.([]);
            // if (router.asPath === "/#home") {
            //   router.replace("/");
            //   router.reload();
            // } else {
            //   router.replace(router.asPath);
            // }
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
