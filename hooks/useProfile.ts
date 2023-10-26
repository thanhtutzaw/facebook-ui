import { AppContext } from "@/context/AppContext";
import { MYPOST_LIMIT } from "@/lib/QUERY_LIMIT";
import { app, getPath, getPostWithMoreInfo } from "@/lib/firebase";
import { changeProfile, checkPhotoURL } from "@/lib/firestore/profile";
import { AppProps, Post, account } from "@/types/interfaces";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAuth } from "firebase/auth";
import {
  Timestamp,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
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
import { useActive } from "./useActiveTab";
function useProfile() {
  const {
    profile,
    uid,
    selectMode,
    setselectMode: setactive,
  } = useContext(AppContext) as AppProps;
  const { active: activeTab } = useActive();
  const router = useRouter();
  const infoRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadElement>(null);
  const [sortToggle, setSortToggle] = useState(false);
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
        getPath("posts", { uid }),
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
      console.log({ hasMore });
      return { posts, hasMore };
    },
    [sortby, uid]
  );
  const { fetchNextPage, isLoading, error, data, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["myPost", sortby, uid, profile?.photoURL],
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
      setSortToggle(false);
    }
  }, [selectMode]);
  const toggleEdit = () => {
    setEditToggle((prev) => !prev);
    setnewProfile(profile!);
  };
  const [newProfile, setnewProfile] = useState<account["profile"]>({
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    bio: profile?.bio ?? "",
    photoURL: checkPhotoURL(profile?.photoURL),
  });

  const handleEditProfileForm = (e: ChangeEvent<HTMLInputElement>) => {
    const { type, value, name, files } = e.target;
    setnewProfile((prev) => ({
      ...prev,
      [name]: type === "file" ? e.target.files?.[0] : value,
    }));
  };
  const [updating, setupdating] = useState(false);
  async function submitProfile(e: FormEvent<HTMLFormElement>) {
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
  return {
    headerRef,
    setIsSticky,
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
    activeTab,
  };
}

export default useProfile;
