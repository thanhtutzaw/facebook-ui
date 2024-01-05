import { usePageContext } from "@/context/PageContext";
import useQueryFn from "@/hooks/useQueryFn";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import useEscape from "../../hooks/useEscape";
import { deleteMultiplePost } from "../../lib/firestore/post";
import s from "../../styles/Home.module.scss";
import BackHeader from "./BackHeader";
function SelectModal({ deletePost }: { deletePost: Function }) {
  const { uid, selectMode, setselectMode } = useAppContext();
  const { selectedId, setSelectedId } = usePageContext();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  useEscape(() => {
    if (!selectMode) return;
    setselectMode(false);
    setSelectedId([]);
  });
  useEffect(() => {
    const handleRouteStart = () => {};
    const handleRouteDone = () => {
      setSelectedId([]);
      setselectMode(false);
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
      onClick={() => {
        setselectMode(false);
        setSelectedId([]);
      }}
      style={{
        position: "initial",
        borderBottom: "4px solid rgb(235, 235, 235)",
      }}
    >
      <h2 className={s.title}>
        <span>{selectedId.length}</span> Selected
      </h2>
      <button
        draggable="false"
        disabled={loading || selectedId?.length === 0}
        onClick={async () => {
          if (!uid || selectedId.length === 0 || !selectedId) return;
          setLoading(true);
          try {
            await deleteMultiplePost(uid, selectedId);
            queryFn.refetchQueries("myPost");
            queryFn.invalidate("myPost");

            setLoading(false);
            setSelectedId([]);
            setselectMode(false);
            selectedId.map((selected) => {
              deletePost(selected.postId);
            });
          } catch (error: unknown) {
            setLoading(false);
            alert(error);
          } finally {
            setSelectedId([]);
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
