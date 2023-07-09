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
import Image from "next/image";
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
import { Post as PostType, Props } from "../../../types/interfaces";
import Post from "../../Post";
import s from "./index.module.scss";
import SortDate from "./SortDate";
import { PostList } from "../Home/PostList";
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
  const [newProfile, setnewProfile] = useState({ ...profile! });
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setnewProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }
  const auth = getAuth(app);
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
      <div ref={infoRef} className={`${s.info} ${active ? s.active : ""}`}>
        <Image
          priority={false}
          className={s.profile}
          width={500}
          height={170}
          style={{ objectFit: "cover", width: "120px", height: "120px" }}
          alt={`${profile?.firstName ?? "Unknown"} ${
            profile?.lastName ?? ""
          }'s profile`}
          src={
            email === "testuser@gmail.com"
              ? "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
              : photoURL
              ? photoURL
              : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
          }
        />
        <h3 style={{ marginBottom: "18px" }}>
          {email === "testuser@gmail.com"
            ? "Peter 1"
            : `${
                edit
                  ? `${newProfile.firstName} ${newProfile.lastName}`
                  : username
              }`}
        </h3>
        {/* <h3 style={{ marginBottom: "18px" }}>
          {email === "testuser@gmail.com"
            ? "Peter 1"
            : `${profile?.firstName ?? "Unknown"} ${profile?.lastName ?? ""}`}
        </h3> */}
        <p
          style={{
            color: profile?.bio === "" ? "gray" : "initial",
            marginTop: "0",
          }}
          className={s.bio}
        >
          {/* Listen I didn&apos;t kill Mysterio. The drones did! */}
          {/* {edit
            ? newProfile.bio
            : profile?.bio === ""
            ? "No Bio Yet"
            : profile?.bio ??
              "Listen I didn&apos;t kill Mysterio. The drones did!"} */}
          {edit
            ? newProfile.bio
            : profile?.bio === ""
            ? "No Bio Yet"
            : profile?.bio}
        </p>
        {!edit ? (
          <motion.button
            onClick={toggleEdit}
            initial={{ opacity: 0 }}
            animate={{ opacity: !edit ? 1 : 0 }}
            exit={{ opacity: 0 }}
            className={s.editToggle}
          >
            Edit Profile
          </motion.button>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: edit ? 1 : 0 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className={s.editProfile}
          >
            <div>
              <input
                onChange={handleChange}
                defaultValue={newProfile?.firstName}
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First Name"
                autoComplete="on"
                spellCheck="false"
                tabIndex={0}
                aria-label="First Name"
                autoCapitalize="sentences"
              />
              <input
                onChange={handleChange}
                defaultValue={newProfile?.lastName}
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last Name"
                autoComplete="on"
                spellCheck="false"
                tabIndex={0}
                aria-label="Last Name"
                autoCapitalize="sentences"
              />
              <input
                onChange={handleChange}
                defaultValue={newProfile?.bio}
                id="bio"
                name="bio"
                type="text"
                placeholder="Bio"
                autoComplete="on"
                spellCheck="false"
                tabIndex={0}
                aria-label="bio"
                autoCapitalize="sentences"
              />
            </div>
            <div>
              <button onClick={toggleEdit}>Cancel</button>
              <button type="submit">Update</button>
            </div>
          </motion.form>
        )}
      </div>

      <div style={{ position: "relative" }} className={s.myPost}>
        <h2 className={s.header}>
          <p>My Posts</p>

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
        </h2>
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

        <PostList active={active!} posts={sortedPost!} tabIndex={1} />
      </div>
    </motion.div>
  );
}
