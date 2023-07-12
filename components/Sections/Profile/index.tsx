import { faGear, faSort } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import {
  Unsubscribe,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  FormEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppContext } from "../../../context/AppContext";
import { useActive } from "../../../hooks/useActiveTab";
import { app, db, postToJSON } from "../../../lib/firebase";
import { changeProfile } from "../../../lib/profile";
import { Post as PostType, Props, account } from "../../../types/interfaces";
import Post from "../../Post";
import s from "./index.module.scss";
import SortDate from "./SortDate";
import { PostList } from "../Home/PostList";
import ProfileInfo from "./ProfileInfo";
import EditProfile from "./EditProfile";
import Content from "./Content";
export default function Profile() {
  const photoURL = "";
  const { username, profile, email, sortedPost, setsortedPost } = useContext(
    AppContext
  ) as Props;
  const {
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
  useEffect(() => {
    setLoading(true);
    if (tab !== "profile") return;
    if (!uid) return;
    let unsub: Unsubscribe;
    const postQuery = query(
      collection(db, `/users/${uid}/posts`),
      orderBy("createdAt", sortby === "old" ? "asc" : "desc")
    );
    unsub = onSnapshot(postQuery, async (snapshot) => {
      const post = await Promise.all(
        snapshot.docs.map(async (doc) => await postToJSON(doc))
      );
      setsortedPost?.(post);
      setLoading(false);
    });
    return () => {
      unsub;
    };
  }, [setsortedPost, sortby, tab, uid]);
  useEffect(() => {
    if (!active) {
      setSort(false);
    }
  }, [active]);
  const [edit, setedit] = useState(false);
  function toggleEdit() {
    setedit((prev) => !prev);
  }

  const [newProfile, setnewProfile] = useState({ ...profile! });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setnewProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // alert(JSON.stringify(newProfile, null, 4));
    // await changeProfile(auth.currentUser!, newProfile, profile!);
    router.replace("/", undefined, { scroll: false });
  }
  return (
    <motion.div
      // transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      style={{ y: active ? -infoRef?.current?.clientHeight! : 0 }}
      className={s.container}
    >
      <ProfileInfo
        active={active!}
        profile={profile}
        email={email ?? "testUser@gmail.com"}
        photoURL={photoURL}
        edit={edit}
        newProfile={newProfile}
        username={username ?? "Peter 1"}
        infoRef={infoRef}
      >
        <EditProfile
          edit={edit}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          newProfile={newProfile}
          toggleEdit={toggleEdit}
        />
      </ProfileInfo>
      <Content
        loading={loading}
        tab={tab}
        sort={sort}
        setSort={setSort}
        active={active!}
        setactive={setactive!}
        sortby={sortby}
        setsortby={setsortby}
        sortedPost={sortedPost! ?? []}
      />
    </motion.div>
  );
}
