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
export default function Profile() {
  const photoURL = "";
  const { username, profile, myPost, email, sortedPost, setsortedPost } =
    useContext(AppContext) as Props;
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
  const [sortby, setsortby] = useState("new");
  useEffect(() => {
    if (tab !== "profile" && !uid) return;
    setsortedPost?.(myPost);
    let unsub: Unsubscribe;
    if (sortby === "old") {
      const mypostQuery = query(
        collection(db, `/users/${uid}/posts`),
        orderBy("createdAt", "asc")
      );
      unsub = onSnapshot(mypostQuery, (snapshot) => {
        setsortedPost?.(snapshot.docs.map((doc) => postToJSON(doc)));
      });
    }
    return () => {
      unsub;
    };
  }, [myPost, setsortedPost, sortby, tab, uid]);
  useEffect(() => {
    if (!active) {
      setSort(false);
    }
  }, [active]);
  const [edit, setedit] = useState(false);
  function toggleEdit() {
    setedit((prev) => !prev);
  }
  const auth = getAuth(app);

  const [newProfile, setnewProfile] = useState({ ...profile! });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setnewProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // alert(JSON.stringify(newProfile, null, 4));
    await changeProfile(auth.currentUser!, newProfile, profile!);
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

      <div style={{ position: "relative" }} className={s.myPost}>
        <header className={s.header}>
          <h2>My Posts</h2>

          <button
            aria-expanded={sort}
            onClick={() => {
              setSort((prev) => !prev);
            }}
            aria-label="sort dropdown toggle"
          >
            <div>
              <FontAwesomeIcon color="#0070f3" icon={faSort} />
            </div>
          </button>
          <button
            aria-label="toggle select mode"
            aria-expanded={active}
            onClick={(e) => {
              setactive?.((prev: any) => !prev);
              setSort(false);
              if (!active) {
                const parent =
                  e.currentTarget.parentElement?.parentElement?.parentElement;
                parent?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <div>
              <motion.span
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                animate={{ rotate: active ? 480 : 0 }}
                style={{
                  willChange: "transform",
                  height: "20px",
                  width: "20px",
                  display: "flex",
                }}
              >
                <FontAwesomeIcon color="#0070f3" icon={faGear} />
              </motion.span>
            </div>
          </button>
        </header>
        <AnimatePresence>
          {sort && (
            <SortDate
              sort={sort}
              sortby={sortby}
              setsortby={setsortby}
              setSort={setSort}
            />
          )}
        </AnimatePresence>
        <PostList preventNavigate={true} active={active!} posts={sortedPost!} tabIndex={1} />
      </div>
    </motion.div>
  );
}
