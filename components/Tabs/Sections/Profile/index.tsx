import EditProfileForm from "@/components/Form/EditProfile";
import { AppContext } from "@/context/AppContext";
import useProfile from "@/hooks/useProfile";
import { AppProps } from "@/types/interfaces";
import { AnimatePresence, motion } from "framer-motion";
import { useContext } from "react";
import Content from "./Content";
import ProfileInfo from "./ProfileInfo";
import s from "./index.module.scss";
import { checkPhotoURL } from "@/lib/firestore/profile";
export default function Profile() {
  const {
    profileSrc,
    selectMode,
    setselectMode: setactive,
  } = useContext(AppContext) as AppProps;
  const {
    activeTab,
    headerRef,
    updateSticky,
    hasNextPage,
    fetchNextPage,
    infoRef,
    handleEditProfileForm,
    editToggle,
    newProfile,
    error,
    isSticky,
    isLoading,
    sortToggle,
    setSortToggle,
    sortby,
    setsortby,
    data,
    updating,
    submitProfile,
    toggleEdit,
  } = useProfile();
  return (
    <div
      id="profile"
      onScroll={(e) => {
        const header = headerRef?.current!;
        const headerRect = header.getBoundingClientRect();
        updateSticky(headerRect.top <= 60);
        if (
          window.innerHeight + e.currentTarget.scrollTop + 1 >=
          e.currentTarget.scrollHeight
        ) {
          if (hasNextPage) {
            fetchNextPage();
          }
        }
      }}
    >
      <motion.div
        // transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        style={{ y: selectMode ? -infoRef?.current?.clientHeight! : 0 }}
        className={s.container}
      >
        <ProfileInfo
          src={checkPhotoURL(profileSrc)}
          handleChange={handleEditProfileForm}
          selectMode={selectMode!}
          editToggle={editToggle}
          newProfile={newProfile}
          infoRef={infoRef}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={editToggle ? "true" : "false"}
              className={s.formContainer}
              initial={{ gridTemplateRows: "0fr" }}
              animate={{ gridTemplateRows: editToggle ? "1fr" : "0fr" }}
              exit={{ gridTemplateRows: "0fr" }}
              transition={{ duration: 0.3 }}
            >
              <EditProfileForm
                updating={updating}
                editToggle={editToggle}
                handleSubmit={submitProfile}
                handleChange={handleEditProfileForm}
                newProfile={newProfile}
                toggleEdit={toggleEdit}
              />
            </motion.div>
          </AnimatePresence>
        </ProfileInfo>

        <Content
          error={error}
          infoRef={infoRef}
          isSticky={isSticky}
          headerRef={headerRef}
          loading={isLoading}
          tab={activeTab}
          sort={sortToggle}
          setSort={setSortToggle}
          selectMode={selectMode!}
          setselectMode={setactive!}
          sortby={sortby}
          setsortby={setsortby}
          sortedPost={data?.pages.flatMap((p) => p?.posts!) ?? []}
          hasNextPage={hasNextPage}
        />
      </motion.div>
    </div>
  );
}
