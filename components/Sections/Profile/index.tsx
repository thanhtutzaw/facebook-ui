import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getAuth } from "firebase/auth";
import {
  Timestamp,
  collection,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { motion } from "framer-motion";
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
import { AppContext, LIMIT } from "../../../context/AppContext";
import { useActive } from "../../../hooks/useActiveTab";
import { app, db, getPostWithMoreInfo } from "../../../lib/firebase";
import { changeProfile } from "../../../lib/profile";
import { Post, Props, account } from "../../../types/interfaces";
import Content from "./Content";
import EditProfile from "./EditProfile";
import ProfileInfo from "./ProfileInfo";
import s from "./index.module.scss";
export default function Profile() {
  const photoURL = "";
  const { username, profile, email, setsortedPost } = useContext(
    AppContext
  ) as Props;
  const {
    account,
    uid,
    selectMode: active,
    setselectMode: setactive,
  } = useContext(AppContext) as Props;
  const { active: tab } = useActive();
  const infoRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (tab !== "profile") {
      setactive?.(false);
    }
    if (active) {
      window.location.hash = "selecting";
    }
    if (!active && tab === "profile" && window.location.hash === "#selecting") {
      router.back();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setactive, tab, active]);
  const [sort, setSort] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortby, setsortby] = useState<"new" | "old">("new");
  const auth = getAuth(app);
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLHeadElement>(null);
  // useEffect(() => {
  //   const profile = document.getElementById("profile");
  //   const handleScroll = () => {
  //     const header = headerRef?.current!;
  //     const headerRect = header.getBoundingClientRect();

  //     setIsSticky(headerRect.top <= 60);
  //   };

  //   profile?.addEventListener("scroll", handleScroll);

  //   return () => {
  //     profile?.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  const fetchMyPost = useCallback(
    async function (pageParam: Post | null = null) {
      console.log("fetching");
      if (!uid) return;
      let postQuery = query(
        collection(db, `/users/${uid}/posts`),
        orderBy("createdAt", sortby === "old" ? "asc" : "desc"),
        limit(LIMIT + 1)
      );
      if (pageParam) {
        const date = new Timestamp(
          pageParam.createdAt.seconds,
          pageParam.createdAt.nanoseconds
        );
        postQuery = query(postQuery, startAfter(date));
      }
      const posts = await getPostWithMoreInfo(postQuery, uid! as string);
      if (!posts) return;
      const hasMore = posts.length > LIMIT;
      if (hasMore) {
        posts.pop();
      }
      return { posts, hasMore };
    },
    [sortby, uid]
  );
  const { fetchNextPage, isLoading, error, data, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["myPost", sortby],
      queryFn: async ({ pageParam }) => await fetchMyPost(pageParam),
      enabled: tab === "profile",
      keepPreviousData: true,
      getNextPageParam: (lastPage) =>
        lastPage?.hasMore
          ? lastPage.posts![lastPage?.posts?.length! - 1]
          : undefined,
    });
  useEffect(() => {
    if (!active) {
      setSort(false);
    }
  }, [active]);
  const [edit, setedit] = useState(false);
  function toggleEdit() {
    setedit((prev) => !prev);
    setnewProfile(profile!);
  }
  const [newProfile, setnewProfile] = useState<account["profile"]>({
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    bio: profile?.bio ?? "",
  });

  function handleEditForm(e: ChangeEvent<HTMLInputElement>) {
    setnewProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }
  const [updating, setupdating] = useState(false);
  async function editProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setupdating(true);
    try {
      await changeProfile(auth.currentUser!, newProfile, profile!);
      setupdating(false);
    } catch (error) {
      console.log("Update Profile Submit Error " + error);
    }
    router.replace("/", undefined, { scroll: false });
    setedit(false);
  }
  return (
    <div
      id="profile"
      onScroll={(e) => {
        const handleScroll = () => {
          const header = headerRef?.current!;
          const headerRect = header.getBoundingClientRect();

          setIsSticky(headerRect.top <= 60);
        };
        handleScroll();
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
        style={{ y: active ? -infoRef?.current?.clientHeight! : 0 }}
        className={s.container}
      >
        {/* <button
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["myPost", sortby] });
          }}
        >
          Refresh
        </button> */}
        <ProfileInfo
          selectMode={active!}
          account={account!}
          profile={profile!}
          email={email ?? "testUser@gmail.com"}
          photoURL={photoURL}
          edit={edit}
          newProfile={newProfile}
          infoRef={infoRef}
        >
          <EditProfile
            updating={updating}
            edit={edit}
            handleSubmit={editProfile}
            handleChange={handleEditForm}
            newProfile={newProfile}
            toggleEdit={toggleEdit}
          />
        </ProfileInfo>

        <Content
          error={error}
          infoRef={infoRef}
          isSticky={isSticky}
          headerRef={headerRef}
          loading={isLoading}
          tab={tab}
          sort={sort}
          setSort={setSort}
          selectMode={active!}
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
