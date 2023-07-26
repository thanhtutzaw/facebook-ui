import { useQuery } from "@tanstack/react-query";
import { User, getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
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
import { AppContext } from "../../../context/AppContext";
import { useActive } from "../../../hooks/useActiveTab";
import {
  app,
  db,
  getPostWithMoreInfo,
  postToJSON,
} from "../../../lib/firebase";
import { changeProfile } from "../../../lib/profile";
import { Post, Props, account } from "../../../types/interfaces";
import Content from "./Content";
import EditProfile from "./EditProfile";
import ProfileInfo from "./ProfileInfo";
import s from "./index.module.scss";
export default function Profile() {
  const photoURL = "";
  const { username, profile, email, sortedPost, setsortedPost } = useContext(
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
  useEffect(() => {
    const profile = document.getElementById("profile");
    const handleScroll = () => {
      const header = headerRef?.current!;
      const headerRect = header.getBoundingClientRect();

      setIsSticky(headerRect.top <= 60);
    };

    profile?.addEventListener("scroll", handleScroll);

    return () => {
      profile?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const fetchMyPost = useCallback(
    async function () {
      // Dont't fetch when current Tab is not profile
      console.log("fetching");

      const postQuery = query(
        collection(db, `/users/${uid}/posts`),
        orderBy("createdAt", sortby === "old" ? "asc" : "desc")
      );
      return await getPostWithMoreInfo(postQuery, uid! as string);
      // const posts = (await Promise.all(
      //   snapShot.docs.map(async (doc) => {
      //     const post = await postToJSON(doc);
      //     const author = auth?.currentUser as User;
      //     return {
      //       ...post,
      //       author: {
      //         ...author,
      //       },
      //     };
      //   })
      // )) as Post[];

      // return await Promise.all(
      //   posts.map(async (p) => {
      //     if (p.sharePost) {
      //       const postDoc = doc(
      //         db,
      //         `users/${p.sharePost?.author}/posts/${p.sharePost?.id}`
      //       );
      //       const posts = await getDoc(postDoc);
      //       if (posts.exists()) {
      //         const post = await postToJSON(posts);
      //         const author = auth?.currentUser as User;
      //         const withAuthor = {
      //           ...post,
      //           author: {
      //             ...author,
      //           },
      //         };
      //         return {
      //           ...p,
      //           sharePost: { ...p.sharePost, post: withAuthor },
      //         };
      //       } else {
      //         return {
      //           ...p,
      //           sharePost: { ...p.sharePost, post: null },
      //         };
      //       }
      //     }
      //     return {
      //       ...p,
      //     };
      //   })
      // );
    },
    [sortby, uid]
  );
  const { isLoading, error, data } = useQuery({
    queryKey: ["myPost"],
    queryFn: async () => await fetchMyPost(),
    enabled: tab === "profile",
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

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setnewProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }
  const [updating, setupdating] = useState(false);
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
    // e.currentTarget?.reset();
  }
  return (
    <motion.div
      // transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      style={{ y: active ? -infoRef?.current?.clientHeight! : 0 }}
      className={s.container}
    >
      {/* {JSON.stringify(profile)} */}
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
          handleSubmit={handleSubmit}
          handleChange={handleChange}
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
        sortedPost={data! ?? []}
      />
    </motion.div>
  );
}
