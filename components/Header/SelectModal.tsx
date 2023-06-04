import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import useEscape from "../../hooks/useEscape";
import { deleteMultiple } from "../../lib/firestore/post";
import { Props } from "../../types/interfaces";
import BackHeader from "./BackHeader";

function SelectModal() {
  const { uid, selectedId, setSelectedId, selectMode, setselectMode } =
    useContext(AppContext) as Props;
  const router = useRouter();

  useEscape(() => {
    if (!selectMode) return;
    setselectMode?.(false);
    setSelectedId?.([]);
  });

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
        onClick={async () => {
          if (!uid || selectedId?.length === 0 || !selectedId) return;
          try {
            await deleteMultiple(uid, selectedId);
            router.replace(router.asPath);
            setTimeout(() => {
              setSelectedId?.([]);
              setselectMode?.(false);
            }, 500);
          } catch (error: any) {
            alert(error.message);
          }
        }}
        className="deleteBtn"
      >
        Delete
      </button>
    </BackHeader>
  );
}

export default SelectModal;
