import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Timestamp } from "firebase/firestore";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchLikedUsers } from "../../lib/firestore/post";
import { Post, account, likes } from "../../types/interfaces";
import Spinner from "../Spinner";
import AuthorInfo from "./AuthorInfo";

export function LikedUsers({
  loading,
  Likes,
  settogglereactionList,
}: {
  loading: boolean;
  Likes: likes;
  settogglereactionList: Function;
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
  const router = useRouter();
  return (
    <>
      <header>
        <p>
          Who reacted this post{" "}
          {`${Likes?.length > 0 && !loading ? Likes.length : "0"}`}
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
                    {new Timestamp(
                      l.createdAt?.seconds,
                      l.createdAt?.nanoseconds
                    )
                      .toDate()
                      .toLocaleDateString("en-US", {
                        year: "2-digit",
                        month: "short",
                        day: "2-digit",
                      })}
                  </p>
                </AuthorInfo>
              </Link>
            ))}
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
