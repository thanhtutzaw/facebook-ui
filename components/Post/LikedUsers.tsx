import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Timestamp,
  Unsubscribe,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { JSONTimestampToDate, db, getProfileByUID } from "../../lib/firebase";
import { Post, account, likes } from "../../types/interfaces";
import Spinner from "../Spinner";
import AuthorInfo from "./AuthorInfo";
import { LikedUsers_LIMIT } from "../../lib/QUERY_LIMIT";

export function LikedUsers({
  count,
  loading,
  Likes,
  settogglereactionList,
  togglereactionList,
  post,
  setLikes,
}: {
  count: number;
  post: Post;
  loading: boolean;
  setLikes: Function;
  Likes: likes;
  settogglereactionList: Function;
  togglereactionList: boolean;
}) {
  // useEffect(() => {
  //   async function getLikes() {
  //     setloading(true);
  //     if (Likes.length > 0) return;
  //     // if (likeCount > Likes.length) return;
  //     try {
  //       setloading(false);
  //       console.log("fetching likes");

  //       setLikes(await fetchLikedUsers(post));
  //     } catch (error) {
  //       console.log(error);
  //       setloading(false);
  //     }
  //   }
  //   getLikes();
  //   return () => {
  //     // setLikes([]);
  //   };
  // }, [Likes, likeCount, post, setLikes]);

  useEffect(() => {
    if (!togglereactionList) return;
    const likeRef = query(
      collection(db, `users/${post.authorId}/posts/${post.id}/likes`),
      orderBy("createdAt", "desc"),
      limit(LikedUsers_LIMIT)
    );
    let unsubscribe: Unsubscribe;
    unsubscribe = onSnapshot(likeRef, async (snapshot) => {
      const likes = snapshot.docs.map((doc) => doc.data()) as likes;
      const withAuthor = await Promise.all(
        likes.map(async (l) => {
          if (l.uid) {
            const author = await getProfileByUID(l.uid?.toString());
            return { ...l, author };
          } else {
            return { ...l, author: null };
          }
        })
      );
      console.log("updatedLIkes");
      setLikes(withAuthor);
    });
    return () => unsubscribe();
  }, [Likes.length, post.authorId, post.id, setLikes, togglereactionList]);

  const router = useRouter();
  return (
    <>
      <header>
        <p>
          Who reacted this post{" "}
          {/* {`${Likes?.length > 0 && !loading ? Likes.length : "0"}`} */}
          {count ?? 0}
        </p>
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            settogglereactionList?.(false);
          }}
          title="Close"
          aria-label="Close"
          tabIndex={-1}
        >
          <FontAwesomeIcon icon={faClose} />
        </motion.button>
      </header>
      {!loading ? (
        Likes?.length > 0 ? (
          <div>
            {Likes.map((l) => (
              <Link href={l.uid.toString()} key={l.uid.toString()}>
                <AuthorInfo
                  layout="row"
                  navigateToProfile={() => {
                    router.push(l.uid.toString());
                  }}
                  profile={l.author as account["profile"]}
                >
                  <p>
                    {JSONTimestampToDate(l.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "2-digit",
                        month: "short",
                        day: "2-digit",
                      }
                    )}
                  </p>
                </AuthorInfo>
              </Link>
            ))}
            {/* <Spinner style={{ marginTop: "10px" }} /> */}
          </div>
        ) : (
          <></>
        )
      ) : (
        <div
          style={{
            height: "calc(50vh - 57px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spinner style={{ margin: "0" }} />
        </div>
      )}
    </>
  );
}
