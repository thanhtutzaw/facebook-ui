import { faGear, faSort } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Unsubscribe,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { AppContext } from "../../../context/AppContext";
import { useActive } from "../../../hooks/useActiveTab";
import { db, postToJSON } from "../../../lib/firebase";
import { Post as PostType, Props } from "../../../types/interfaces";
import Post from "../../Post";
import s from "./Profile.module.scss";
import SortDropdown from "./SortDropdown";
export default function Profile() {
  const photoURL = "";
  const { myPost, email, sortedPost, setsortedPost } = useContext(
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
      // const myPost = myPostSnap.docs.map((doc) => postToJSON(doc));
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
          alt={email || "profile"}
          src={
            email === "testuser@gmail.com"
              ? "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
              : photoURL
              ? photoURL
              : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
          }
        />
        <h3>{email === "testuser@gmail.com" ? "Peter 1" : email}</h3>
        <p className={s.bio}>
          Listen I didn&apos;t kill Mysterio. The drones did!
        </p>
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
            <SortDropdown
              sort={sort}
              sortby={sortby}
              setsortby={setsortby}
              setSort={setSort}
            />
          )}
        </AnimatePresence>
        <div
          style={{
            willChange: "margin",
            marginInline: active ? "2rem" : "initial",
            transition: "margin .35s ease-in-out",
          }}
        >
          {sortedPost?.map((post: PostType) => (
            <Post active={active} key={post.id} post={post} tabIndex={1} />
          ))}
        </div>
        <p style={{ textAlign: "center" }}>No more posts</p>
      </div>
    </motion.div>
  );
}
