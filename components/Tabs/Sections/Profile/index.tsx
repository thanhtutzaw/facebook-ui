import { EditProfileForm } from "@/components/Form/EditProfile";
import { useAppContext } from "@/context/AppContext";
import useProfile from "@/hooks/useProfile";
import { checkPhotoURL } from "@/lib/firestore/profile";
import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";
import { Content } from "./Content";
import ProfileInfo from "./ProfileInfo";
import s from "./index.module.scss";
function Profile({ tabIndex }: { tabIndex: number }) {
  const {
    profileSrc,
    selectMode,
    setselectMode: setactive,
  } = useAppContext();
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
    sortby,
    setsortby,
    data,
    updating,
    submitProfile,
    toggleEdit,
  } = useProfile();
  return (
    <div
      aria-hidden={tabIndex === -1}
      id="profile"
      tabIndex={tabIndex}
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
export default memo(Profile);
