import EditProfileForm from "@/components/Input/EditProfileForm";
import { AppContext } from "@/context/AppContext";
import { useActive } from "@/hooks/useActiveTab";
import { MYPOST_LIMIT } from "@/lib/QUERY_LIMIT";
import { app, db, getPostWithMoreInfo } from "@/lib/firebase";
import { changeProfile } from "@/lib/firestore/profile";
import { Post, AppProps, account } from "@/types/interfaces";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAuth } from "firebase/auth";
import {
  Timestamp,
  collection,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Content from "./Content";
import ProfileInfo from "./ProfileInfo";
import s from "./index.module.scss";
export default function Profile() {
  const {
    profile,
    account,
    uid,
    selectMode,
    setselectMode: setactive,
  } = useContext(AppContext) as AppProps;
  const { active: activeTab } = useActive();
  const router = useRouter();
  const infoRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadElement>(null);
  const [sort, setSort] = useState(false);
  const [sortby, setsortby] = useState<"new" | "old">("new");
  const auth = getAuth(app);
  const [isSticky, setIsSticky] = useState(false);
  const [editToggle, setEditToggle] = useState(false);

  useEffect(() => {
    if (activeTab !== "profile") {
      setactive?.(false);
    }
    if (selectMode) {
      window.location.hash = "selecting";
    }
    if (
      !selectMode &&
      activeTab === "profile" &&
      window.location.hash === "#selecting"
    ) {
      router.back();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setactive, activeTab, selectMode]);

  const fetchMyPost = useCallback(
    async function (pageParam: Post | null = null) {
      console.log("fetching");
      if (!uid) return;
      let postQuery = query(
        collection(db, `/users/${uid}/posts`),
        orderBy("createdAt", sortby === "old" ? "asc" : "desc"),
        limit(MYPOST_LIMIT + 1)
      );
      if (pageParam) {
        const date = new Timestamp(
          pageParam.createdAt.seconds,
          pageParam.createdAt.nanoseconds
        );
        postQuery = query(postQuery, startAfter(date));
      }
      const posts = await getPostWithMoreInfo(uid!, postQuery);
      if (!posts) return;
      const hasMore = posts.length > MYPOST_LIMIT;
      if (hasMore) {
        posts.pop();
      }
      return { posts, hasMore };
    },
    [sortby, uid]
  );
  const { fetchNextPage, isLoading, error, data, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["myPost", sortby, uid],
      queryFn: async ({ pageParam }) => await fetchMyPost(pageParam),
      enabled: activeTab === "profile",
      keepPreviousData: true,
      getNextPageParam: (lastPage) =>
        lastPage?.hasMore
          ? lastPage.posts![lastPage?.posts?.length! - 1]
          : undefined,
    });
  useEffect(() => {
    if (!selectMode) {
      setSort(false);
    }
  }, [selectMode]);
  const toggleEdit = () => {
    setEditToggle((prev) => !prev);
    setnewProfile(profile!);
    // setnewProfile(newProfile!);
  };
  const [newProfile, setnewProfile] = useState<account["profile"]>({
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    bio: profile?.bio ?? "",
    photoURL:
      profile?.photoURL ??
      "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
  });

  const handleEditProfileForm = (e: ChangeEvent<HTMLInputElement>) => {
    const { type, value, name, files } = e.target;
    setnewProfile((prev) => ({
      ...prev,
      [name]: type === "file" ? e.target.files?.[0] : value,
    }));
    console.log(newProfile);
    // console.log(type === "file");
  };
  const [updating, setupdating] = useState(false);
  async function editProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setupdating(true);
    try {
      await changeProfile(auth.currentUser!, newProfile, profile!);
      setupdating(false);
      setEditToggle(false);
    } catch (error) {
      console.log("Update Profile Error: " + error);
    }
    router.replace("/", undefined, { scroll: false });
  }
  return (
    <div
      id="profile"
      onScroll={(e) => {
        const header = headerRef?.current!;
        const headerRect = header.getBoundingClientRect();
        setIsSticky(headerRect.top <= 60);
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
          handleChange={handleEditProfileForm}
          selectMode={selectMode!}
          account={account!}
          profile={profile!}
          editToggle={editToggle}
          newProfile={newProfile}
          infoRef={infoRef}
        >
          {/* <motion.button
            onClick={toggleEdit}
            // initial={{ opacity: 0 }}
            // animate={{ opacity: !editToggle ? 1 : 0 }}
            // exit={{ opacity: 0 }}
            className={s.editToggle}
          >
            <FontAwesomeIcon icon={faPen} />
            Edit Profile
          </motion.button> */}
          <AnimatePresence mode="wait">
            <motion.div
              key={editToggle ? "true" : "false"}
              className={s.formContainer}
              // initial={{
              //   gridTemplateRows: "0fr",
              // }}
              // animate={{
              //   gridTemplateRows: editToggle ? "1fr" : "0fr",
              // }}
              // exit={{
              //   gridTemplateRows: "0fr",
              // }}
              initial={{ gridTemplateRows: "0fr" }}
              animate={{ gridTemplateRows: editToggle ? "1fr" : "0fr" }}
              exit={{ gridTemplateRows: "0fr" }}
              transition={{ duration: 0.3 }}
              // style={{
              //   gridTemplateRows: editToggle ? "1fr" : "0fr",
              // }}
            >
              {/* <div className={s.editProfile}>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
            </div> */}
              {/* <AnimatePresence mode="sync"> */}
              <EditProfileForm
                updating={updating}
                editToggle={editToggle}
                handleSubmit={editProfile}
                handleChange={handleEditProfileForm}
                newProfile={newProfile}
                toggleEdit={toggleEdit}
              />
              {/* </AnimatePresence> */}
            </motion.div>
          </AnimatePresence>
        </ProfileInfo>

        <Content
          profile={profile!}
          error={error}
          infoRef={infoRef}
          isSticky={isSticky}
          headerRef={headerRef}
          loading={isLoading}
          tab={activeTab}
          sort={sort}
          setSort={setSort}
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
