import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Unsubscribe, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import {
  DescQuery,
  JSONTimestampToDate,
  getPath,
  getProfileByUID,
} from "../../lib/firebase";
import { Post, account, likes } from "../../types/interfaces";
import AuthorInfo from "../AuthorInfo";
import Spinner from "../Spinner";

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
  Likes: likes[];
  settogglereactionList: Function;
  togglereactionList: boolean;
}) {
  useEffect(() => {
    if (!togglereactionList) return;
    const likeRef = DescQuery(
      getPath("likes", {
        authorId: String(post.authorId),
        postId: String(post.id),
      })
    );
    let unsubscribe: Unsubscribe;
    unsubscribe = onSnapshot(likeRef, async (snapshot) => {
      const likes = snapshot.docs.map((doc) => doc.data()) as likes[];
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
        Likes?.length > 0 && (
          <ul>
            {Likes.map((like) => (
              <Link href={"/" + String(like.uid)} key={String(like.uid)}>
                <AuthorInfo>
                  <AuthorInfo.User
                    layout="row"
                    profile={like.author as account["profile"]}
                    navigateToProfile={() => {
                      if (router.pathname === "/") {
                        router.push(
                          {
                            query: {
                              user: String(like.uid),
                            },
                          },
                          String(like.uid)
                        );
                      } else {
                        router.push(`/${String(like.uid)}`);
                      }
                    }}
                  >
                    <AuthorInfo.UserName
                      profile={like.author as account["profile"]}
                      navigateToProfile={() => {
                        if (router.pathname === "/") {
                          router.push(
                            {
                              query: {
                                user: String(like.uid),
                              },
                            },
                            String(like.uid)
                          );
                        } else {
                          router.push(`/${String(like.uid)}`);
                        }
                      }}
                    />
                  </AuthorInfo.User>
                  <p>
                    {JSONTimestampToDate(like.createdAt).toLocaleDateString(
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
          </ul>
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
          <Spinner />
        </div>
      )}
    </>
  );
}
