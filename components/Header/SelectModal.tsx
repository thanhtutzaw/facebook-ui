import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import useEscape from "../../hooks/useEscape";
import { deleteMultiple } from "../../lib/firestore/post";
import { Props } from "../../types/interfaces";
import BackHeader from "./BackHeader";
import { PageContext, PageProps } from "../../context/PageContext";
import { useQueryClient } from "@tanstack/react-query";
import s from "../../styles/Home.module.scss";
function SelectModal() {
  const { updatePost, uid, selectMode, setselectMode } = useContext(
    AppContext
  ) as Props;
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
  const queryClient = useQueryClient();

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
            await deleteMultiple(uid, selectedId);
            queryClient.refetchQueries(["myPost"]);
            queryClient.invalidateQueries(["myPost"]);

            setLoading(false);
            setSelectedId?.([]);
            setselectMode?.(false);
            // selectedId.map((s) => {
            //   // updatePost?.(s.post);
            // });
          } catch (error: any) {
            setLoading(false);
            alert(error.message);
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
